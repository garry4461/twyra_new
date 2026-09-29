import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });
const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  company: z.string().trim().min(1, "Enter your company name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  phone: z.string().trim().regex(/^\d{7,15}$/, "Enter a valid mobile number using 7–15 digits."),
  address1: z.string().trim().min(1, "Enter your address.").max(160),
  address2: z.string().trim().max(160),
  city: z.string().trim().min(1, "Choose or enter your town or city.").max(80),
  postcode: z.string().trim().min(1, "Enter your area or post code.").max(20),
  country: z.string().trim().min(1, "Choose your country."),
  password: z.string().min(6, "Password must be at least 6 characters.").max(128),
});

const phoneCountryCodes = [
  { country: "United Kingdom", code: "+44" }, { country: "United States", code: "+1" },
  { country: "Canada", code: "+1" }, { country: "Australia", code: "+61" },
  { country: "India", code: "+91" }, { country: "Ireland", code: "+353" },
  { country: "New Zealand", code: "+64" }, { country: "South Africa", code: "+27" },
  { country: "United Arab Emirates", code: "+971" }, { country: "Pakistan", code: "+92" },
  { country: "Bangladesh", code: "+880" }, { country: "France", code: "+33" },
  { country: "Germany", code: "+49" }, { country: "Spain", code: "+34" },
  { country: "Italy", code: "+39" }, { country: "Netherlands", code: "+31" },
  { country: "Nigeria", code: "+234" }, { country: "Philippines", code: "+63" },
  { country: "Singapore", code: "+65" }, { country: "Other", code: "+" },
];

const countries = [
  "Australia", "Bangladesh", "Canada", "France", "Germany", "India", "Ireland", "Italy",
  "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Philippines", "Singapore",
  "South Africa", "Spain", "United Arab Emirates", "United Kingdom", "United States", "Other",
];

const townsByCountry: Record<string, string[]> = {
  "United Kingdom": ["London", "Birmingham", "Manchester", "Glasgow", "Leeds", "Liverpool", "South Normanton", "Nottingham", "Sheffield", "Bristol", "Other / not listed"],
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Other / not listed"],
  Canada: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Other / not listed"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Other / not listed"],
  India: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Other / not listed"],
  Ireland: ["Dublin", "Cork", "Galway", "Limerick", "Waterford", "Other / not listed"],
};

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or register | ArtworkGuru" },
      { name: "description", content: "Sign in to your ArtworkGuru artwork portal or create a customer account." },
      { property: "og:title", content: "ArtworkGuru customer portal" },
      { property: "og:description", content: "Sign in or create an ArtworkGuru customer account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});


function newCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 9), b: 1 + Math.floor(Math.random() * 9) };
}

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+44");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [captcha, setCaptcha] = useState(() => newCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent — please check your email inbox.");
        setMode("signin");
        return;
      }
      if (mode === "signup") {
        if (Number(captchaAnswer) !== captcha.a + captcha.b) {
          toast.error("Security check answer is incorrect. Please try again.");
          setCaptcha(newCaptcha());
          setCaptchaAnswer("");
          return;
        }
        if (!detailsConfirmed) {
          toast.error("Please confirm that your registration details are correct.");
          return;
        }
        const validated = signupSchema.parse({
          fullName, company, email, phone: phone.replace(/\D/g, ""), address1,
          address2, city: city === "Other / not listed" ? customCity : city,
          postcode, country, password,
        });
        const { error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            data: {
              full_name: validated.fullName,
              company: validated.company,
              phone: `${phoneCode}${validated.phone}`,
              address_line1: validated.address1,
              address_line2: validated.address2,
              city: validated.city,
              postcode: validated.postcode,
              country: validated.country,
            },
          },
        });
        if (error) throw error;
        toast.success("Thanks for registering with ArtworkGuru — 10 free credits added to your Trial Pack.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof z.ZodError ? err.issues[0]?.message ?? "Check your details." : (err as Error).message);
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <Link to="/" className="flex items-center justify-center mb-6">
            <img src="/logo.svg" alt="ArtworkGuru" className="h-16 w-auto" />
          </Link>

          <h1 className="text-2xl font-bold mb-1">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signin" ? "Access your artwork portal" : "Start submitting jobs today"}
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="company">Company name *</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="phone">Mobile number *</Label>
                  <div className="flex gap-2">
                    <Select value={phoneCode} onValueChange={setPhoneCode}>
                      <SelectTrigger aria-label="Country calling code" className="w-32 shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {phoneCountryCodes.map((item) => <SelectItem key={`${item.country}-${item.code}`} value={item.code}>{item.country} ({item.code})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={25} aria-describedby="phone-hint" />
                  </div>
                  <p id="phone-hint" className="mt-1 text-xs text-muted-foreground">Enter the number without the country code.</p>
                </div>
                <div>
                  <Label htmlFor="address1">Address line 1 *</Label>
                  <Input id="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} required maxLength={160} />
                </div>
                <div>
                  <Label htmlFor="address2">Address line 2</Label>
                  <Input id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} maxLength={160} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city">Town / City *</Label>
                    <Select value={city} onValueChange={(value) => { setCity(value); if (value !== "Other / not listed") setCustomCity(""); }}>
                      <SelectTrigger id="city"><SelectValue placeholder="Choose a town or city" /></SelectTrigger>
                      <SelectContent>
                        {(townsByCountry[country] ?? ["Other / not listed"]).map((town) => <SelectItem key={town} value={town}>{town}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postcode">Area / Post code *</Label>
                    <Input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} required maxLength={20} />
                  </div>
                </div>
                {city === "Other / not listed" && (
                  <div>
                    <Label htmlFor="customCity">Town / city *</Label>
                    <Input id="customCity" value={customCity} onChange={(e) => setCustomCity(e.target.value)} required maxLength={80} />
                  </div>
                )}
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select value={country} onValueChange={(value) => { setCountry(value); setCity(""); setCustomCity(""); }}>
                    <SelectTrigger id="country"><SelectValue placeholder="Choose your country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={128} className="pr-11" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {mode === "signup" && (
              <>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <Label htmlFor="captcha">Security check *</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="rounded-md bg-background px-3 py-2 font-mono text-base font-semibold tracking-wider select-none">
                      {captcha.a} + {captcha.b} = ?
                    </span>
                    <Input
                      id="captcha"
                      inputMode="numeric"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, ""))}
                      className="w-24"
                      required
                      aria-label="Answer the security question"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setCaptcha(newCaptcha()); setCaptchaAnswer(""); }} aria-label="New security question">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">This helps us confirm you are a real person — no email confirmation link needed.</p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-muted-foreground">
                  <Checkbox checked={detailsConfirmed} onCheckedChange={(checked) => setDetailsConfirmed(checked === true)} className="mt-0.5" />
                  <span>I confirm that the information I provided is correct.</span>
                </label>

                <p className="rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-foreground">
                  <strong>10 free credits</strong> are added to your Trial Pack when you sign up. No purchase needed.
                </p>
              </>
            )}

            <Button type="submit" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button
            className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </Card>

      </div>
    </div>
  );
}
