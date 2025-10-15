import { useState } from "react";
import {
  Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle2,
  Building2, ShieldCheck, Info, Sparkles, ArrowRight, AlertCircle
} from "lucide-react";

const colors = {
  bg: "bg-[#F7F2EC]",
  card: "bg-[#E8CBAE]",
  primary: "bg-[#7F232E] text-white hover:bg-[#6b1e27]",
  outline: "border-[#7F232E]/20",
  accent: "text-[#5B6E02]",
};

type Office = {
  city: string;
  lines: string[];
  phone: string;
  hours: string;
};

const OFFICES: Office[] = [
  {
    city: "Locust Grove",
    lines: ["Locust Grove, GA 30248"],
    phone: "(404) 555-0123",
    hours: "Mon–Fri · 9AM–6PM ET",
  },
];

function ContactCard({
  icon: Icon,
  title,
  subtitle,
  cta,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className={`group ${colors.card} rounded-2xl p-5 shadow-sm border ${colors.outline} transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#7F232E]/40`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-xl bg-white/70 p-3">
          <Icon className="h-6 w-6 text-[#7F232E]" />
        </div>
        <h3 className="text-lg font-semibold text-[#2b2b2b]">{title}</h3>
      </div>
      <p className="text-sm text-[#4b4b4b] mb-3">{subtitle}</p>
      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#7F232E]">
        {cta} <ArrowRight className="h-4 w-4 transition -translate-x-0 group-hover:translate-x-0.5" />
      </div>
    </a>
  );
}

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
          consentSms: form.get("consentSms") === "on",
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className={`${colors.bg} min-h-screen`}>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="rounded-3xl p-8 md:p-10 border bg-white/60 backdrop-blur-sm border-[#7F232E]/10 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-[#7F232E] mb-2">
                <Sparkles className="h-4 w-4" />
                We're here for artisans & food lovers
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#2b2b2b]">
                Contact Craved Artisan Support
              </h1>
              <p className="mt-2 text-[#555] max-w-2xl">
                Get help with orders, sales windows, inventory, labels, and more. Choose a quick action or send us a message—our AI assistant routes your request to the right place.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-[#4b4b4b]">
                <ShieldCheck className="h-4 w-4 text-[#5B6E02]" />
                We reply via in-app <strong className="ml-1">System Messages</strong>. (Later, you can opt-in for SMS.)
              </div>
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[#E8CBAE] text-[#2b2b2b] border border-[#7F232E]/15">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="h-5 w-5 text-[#7F232E]" /> Hours
              </div>
              <div className="mt-1 text-sm">Mon–Fri · 9AM–6PM ET</div>
              <div className="text-sm">Sat · 10AM–2PM ET</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mx-auto max-w-6xl px-4 mt-8 grid gap-4 sm:grid-cols-3">
        <ContactCard
          icon={Mail}
          title="Message Support"
          subtitle="Create a support ticket and we'll reply in System Messages."
          cta="Start a ticket"
          href="#contact-form"
        />
        <ContactCard
          icon={MessageCircle}
          title="Live Chat"
          subtitle="Chat with our AI assistant for instant answers."
          cta="Open chat"
          href="/chat"
        />
        <ContactCard
          icon={Phone}
          title="Call Us"
          subtitle="Prefer a human? Request a callback from our team."
          cta="Request a call"
          href="/callback"
        />
      </section>

      {/* MAIN GRID */}
      <section className="mx-auto max-w-6xl px-4 my-10 grid gap-6 lg:grid-cols-3">
        {/* FORM */}
        <div id="contact-form" className="lg:col-span-2">
          <div className={`rounded-3xl border ${colors.outline} bg-white/70 backdrop-blur-sm p-6 md:p-8`}>
            <div className="flex items-center gap-2 mb-4">
              <Send className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-xl font-semibold text-[#2b2b2b]">Send us a message</h2>
            </div>

            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Name *</span>
                  <input
                    name="name"
                    required
                    className="rounded-xl border px-3 py-2 bg-white/80 border-[#7F232E]/20 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                    placeholder="Your name"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Email *</span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="rounded-xl border px-3 py-2 bg-white/80 border-[#7F232E]/20 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Subject *</span>
                <select
                  name="subject"
                  required
                  className="rounded-xl border px-3 py-2 bg-white/80 border-[#7F232E]/20 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                >
                  <option value="">Select a subject…</option>
                  <option>Orders & Delivery</option>
                  <option>Vendor & Sales Windows</option>
                  <option>Inventory & Labels</option>
                  <option>Billing</option>
                  <option>General</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Message *</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="rounded-xl border px-3 py-2 bg-white/80 border-[#7F232E]/20 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  placeholder="Tell us how we can help…"
                />
              </label>

              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="consentSms" className="mt-1" />
                <span>
                  I'd like to receive SMS updates for this ticket (you can opt-out anytime).
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  disabled={status === "sending"}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 ${colors.primary} disabled:opacity-60`}
                >
                  {status === "sending" ? "Sending…" : "Send Message"}
                </button>
                {status === "ok" && (
                  <span className="flex items-center gap-1 text-[#5B6E02] text-sm">
                    <CheckCircle2 className="h-4 w-4" /> Thanks! We'll reply in System Messages.
                  </span>
                )}
                {status === "err" && (
                  <span className="flex items-center gap-1 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4" /> Something went wrong. Please try again.
                  </span>
                )}
              </div>
            </form>

            {/* trust row */}
            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-[#4b4b4b]">
                <Building2 className="h-4 w-4 text-[#7F232E]" />
                Vendor-first support
              </div>
              <div className="flex items-center gap-2 text-[#4b4b4b]">
                <Clock className="h-4 w-4 text-[#7F232E]" />
                Typical reply: under 1 hour
              </div>
              <div className="flex items-center gap-2 text-[#4b4b4b]">
                <ShieldCheck className="h-4 w-4 text-[#7F232E]" />
                Data stays private
              </div>
            </div>
          </div>
        </div>

        {/* MAP / IMAGE + OFFICES */}
        <aside className="space-y-6">
          <div className="rounded-3xl overflow-hidden border bg-white/70 backdrop-blur-sm border-[#7F232E]/10">
            <div className="h-56 w-full relative">
              {/* Replace with your static map or brand image */}
              <img
                src="https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1200&auto=format&fit=crop"
                alt="Craved locations"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-[#7F232E]" />
                <h3 className="font-semibold text-[#2b2b2b]">Our Offices</h3>
              </div>
              <div className="space-y-4">
                {OFFICES.map((o) => (
                  <div key={o.city} className="rounded-xl border border-[#7F232E]/15 p-4">
                    <div className="font-semibold">{o.city}</div>
                    <div className="text-sm text-[#4b4b4b]">
                      {o.lines.map((l, i) => (
                        <div key={i}>{l}</div>
                      ))}
                      <div className="mt-1">{o.hours}</div>
                      <div className="mt-1">{o.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="rounded-3xl border bg-white/70 backdrop-blur-sm p-5 border-[#7F232E]/10">
            <h3 className="font-semibold text-[#2b2b2b] mb-3">Quick Answers</h3>
            <details className="rounded-xl border p-3 mb-2 bg-white/70">
              <summary className="cursor-pointer font-medium">Where do replies go?</summary>
              <p className="mt-2 text-sm text-[#4b4b4b]">
                We'll reply in your in-app <strong>System Messages</strong>. You can enable SMS later.
              </p>
            </details>
            <details className="rounded-xl border p-3 mb-2 bg-white/70">
              <summary className="cursor-pointer font-medium">How fast is support?</summary>
              <p className="mt-2 text-sm text-[#4b4b4b]">
                Most tickets receive a first response within one hour during business hours.
              </p>
            </details>
            <details className="rounded-xl border p-3 bg-white/70">
              <summary className="cursor-pointer font-medium">Do you have phone support?</summary>
              <p className="mt-2 text-sm text-[#4b4b4b]">
                Yes—request a callback and we'll place you in the queue.
              </p>
            </details>
          </div>
        </aside>
      </section>

      {/* FOOTER STRIP */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className={`rounded-2xl ${colors.card} p-5 flex flex-col md:flex-row items-center justify-between gap-3`}>
          <div className="text-[#2b2b2b]">
            Still stuck? Our AI assistant can triage most requests instantly.
          </div>
          <a href="/chat" className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 ${colors.primary}`}>
            Open AI Chat <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}