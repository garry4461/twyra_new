import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "artworkguru.support-chat.v1";

const SUGGESTIONS = [
  "How do credits work?",
  "What's the turnaround time?",
  "Should I pick monthly or credits?",
  "I'd like to talk to your team",
];

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as UIMessage[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  
  const [initialMessages] = useState<UIMessage[]>(() => loadMessages());
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat" }));
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "artworkguru-support",
    messages: initialMessages,
    transport,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full or unavailable — chat still works for this session */
    }
  }, [messages]);

  useEffect(() => {
    if (open && status !== "streaming") textareaRef.current?.focus();
  }, [open, status]);

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    void sendMessage({ text: value });
  };


  const reset = () => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    textareaRef.current?.focus();
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full p-0 shadow-lg"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          "fixed bottom-24 right-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl transition-all duration-200",
          open
            ? "pointer-events-auto h-[min(32rem,calc(100vh-9rem))] opacity-100"
            : "pointer-events-none h-0 translate-y-3 opacity-0",
        )}
        aria-hidden={!open}
      >
        <header className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
          <img src="/logo.svg" alt="" className="h-8 w-8 rounded-md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Ask ArtworkGuru</p>
            <p className="truncate text-xs text-muted-foreground">
              Answers on pricing, credits & turnaround
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Start a new conversation"
            onClick={reset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </header>

        <Conversation className="flex-1">
          <ConversationContent className="gap-3">
            {messages.length === 0 ? (
              <div className="space-y-3 px-1 py-2">
                <p className="text-sm text-muted-foreground">
                  Hi! I can help with artwork services, credits, plans and turnaround times — or
                  pass you to our team.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const text = message.parts
                  .map((part) => (part.type === "text" ? part.text : ""))
                  .join("");
                const savedLead = message.parts.some(
                  (part) =>
                    part.type === "tool-capture_contact" &&
                    (part as { state?: string }).state === "output-available",
                );
                return (
                  <Message from={message.role} key={message.id}>
                    <MessageContent
                      className={cn(
                        "text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent p-0 text-foreground",
                      )}
                    >
                      {text ? <MessageResponse>{text}</MessageResponse> : null}
                      {savedLead ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Your details were sent to the ArtworkGuru team.
                        </p>
                      ) : null}
                    </MessageContent>
                  </Message>
                );
              })
            )}

            {status === "submitted" ? <Shimmer className="text-sm">Thinking…</Shimmer> : null}
            {error ? (
              <p className="text-sm text-destructive">
                Sorry — the assistant is unavailable right now. Please try again in a moment.
              </p>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t p-3">
          <PromptInput
            onSubmit={(message, event) => {
              event.preventDefault();
              send(message.text ?? "");
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Ask about pricing, credits, file formats…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>

      </div>
    </>
  );
}
