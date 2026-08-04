import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";

import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are "Guru", the friendly support assistant on the ArtworkGuru website (artwork services for print, merch and embroidery companies).

What you know about ArtworkGuru:
- Services: vector artwork redraws, design layouts, complex/custom artwork, embroidery digitizing and mockups. Typical turnaround 12-24 hours.
- Two ways to buy:
  1) Unlimited Monthly plan — unlimited design submissions, best value once estimated spend goes above £399/month.
  2) FlexCredits (pay as you go) — Starter Pack: 10 credits for £99 (first order gets 10 extra credits free). Growth Pack: 50 credits for £399. Credits never expire.
- Rough credit usage: Job Type 1 (Logo w/ text) 5 credits, Job Type 2 (Design layout) 7 credits, Job Type 3 (Complex artwork) 10 credits, Job Type 4 (Custom artwork) 15 credits.
- Customers submit jobs in the portal (sign in at /auth), choose job type, colour scheme (Black & White, B&W with Gradients, Spot Colors with/without Gradients, CMYK 4 colour), output formats (ai, eps, cdr, jpg, gif, bmp, psd, pdf, tiff) and can upload up to 10 files.
- Job workflow: Submitted -> Under production -> In review -> QA -> Completed. Customers get notified when a job is ready, can download files and raise a revision request.

How to behave:
- Be concise, warm and helpful. 1-3 short paragraphs or a short bullet list. Use plain language, no jargon.
- Only answer using the facts above plus general help about using the site. Never invent prices, turnaround times or policies.
- If the visitor asks something you cannot answer confidently (custom quotes, invoices, account-specific issues, complaints), or if they ask to speak to a human, offer to pass it to the team. Ask for their email address (and name if not given), then call the capture_contact tool once you have a valid email. After the tool succeeds, confirm the team will reply by email.
- Never ask for payment details or passwords.`;

const contactSchema = z.object({
  name: z.string().nullable(),
  email: z.string(),
  question: z.string(),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let messages: UIMessage[];
        try {
          const body = (await request.json()) as { messages?: unknown };
          if (!Array.isArray(body.messages)) {
            return new Response("Messages are required", { status: 400 });
          }
          messages = body.messages as UIMessage[];
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("AI is not configured", { status: 500 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);

        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system: SYSTEM_PROMPT,
          messages: convertToModelMessages(messages),
          stopWhen: stepCountIs(50),
          tools: {
            capture_contact: tool({
              description:
                "Save a website visitor's contact details so the ArtworkGuru team can follow up by email. Call this only once you have a valid email address.",
              inputSchema: contactSchema,
              execute: async ({ name, email, question }) => {
                const clean = email.trim().toLowerCase();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
                  return { saved: false, error: "That email address doesn't look valid." };
                }
                const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
                const { error } = await supabaseAdmin.from("support_leads").insert({
                  name: name?.trim() || null,
                  email: clean,
                  question: question.slice(0, 2000),
                });
                if (error) {
                  console.error("support_leads insert failed", error);
                  return { saved: false, error: "Could not save the request right now." };
                }
                return { saved: true, email: clean };
              },
            }),
          },
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});
