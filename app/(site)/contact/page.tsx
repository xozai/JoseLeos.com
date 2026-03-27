import type { Metadata } from "next";
import ContactForm from "@/components/home/ContactForm";
import CalendlyWidget from "@/components/calendly/CalendlyWidget";
import { Mail, Github, Twitter, Linkedin, Calendar } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Jose Leos.",
};

const CONTACT_METHODS = [
  { icon: Mail, label: "Email", value: "jose@joseLeos.com", href: "mailto:jose@joseLeos.com" },
  { icon: Twitter, label: "Twitter / X", value: "@joseleos", href: "https://twitter.com/joseleos" },
  { icon: Github, label: "GitHub", value: "joseleos", href: "https://github.com/joseleos" },
  { icon: Linkedin, label: "LinkedIn", value: "in/joseleos", href: "https://linkedin.com/in/joseleos" },
];

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Get in Touch</h1>
        <p className="text-lg text-[--foreground-muted]">
          Have a project in mind, a question, or just want to say hi? I&apos;d love to hear from you.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-10">
        {/* Contact Methods */}
        <div className="space-y-4">
          {CONTACT_METHODS.map(({ icon: Icon, label, value, href }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center gap-3 p-4 rounded-xl border border-[--border] hover:border-[--primary] transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[--background-secondary] flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[--foreground-muted] group-hover:text-[--primary] transition-colors" />
              </div>
              <div>
                <p className="text-xs text-[--foreground-muted]">{label}</p>
                <p className="text-sm font-medium text-[--foreground]">{value}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <ContactForm />
      </div>

      {/* Book a Meeting */}
      <div className="mt-16 pt-12 border-t border-[--border]">
        <div className="flex items-center gap-3 mb-2">
          <Calendar size={20} className="text-[--primary]" />
          <h2 className="text-2xl font-bold text-[--foreground]">Book a Meeting</h2>
        </div>
        <p className="text-[--foreground-muted] mb-8 max-w-xl">
          Prefer to talk live? Pick a slot on my calendar — no back-and-forth emails needed.{" "}
          <Link href="/booking" className="text-[--primary] hover:underline">
            Open full scheduling page →
          </Link>
        </p>
        <CalendlyWidget height={630} />
      </div>
    </div>
  );
}
