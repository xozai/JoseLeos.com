import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import CalendlyWidget from "@/components/calendly/CalendlyWidget";

export const metadata: Metadata = {
  title: "Book a Meeting | Jose Leos",
  description:
    "Schedule a 1-on-1 call with Jose Leos. Pick a time that works for you — free, 30-minute discovery calls available.",
  alternates: {
    canonical: "/booking",
  },
  openGraph: {
    title: "Book a Meeting with Jose Leos",
    description: "Schedule a call directly on Jose's calendar.",
  },
};

export default function BookingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[--background-secondary] flex items-center justify-center mx-auto mb-4 border border-[--border]">
          <Calendar size={24} className="text-[--primary]" />
        </div>
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Book a Meeting</h1>
        <p className="text-lg text-[--foreground-muted] max-w-lg mx-auto">
          Pick a time that works for you. I&apos;m happy to chat about projects,
          collaborations, or anything else on your mind.
        </p>
      </header>

      <CalendlyWidget height={700} />
    </div>
  );
}
