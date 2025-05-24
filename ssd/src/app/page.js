// --- src/app/page.js ---
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { Sponsors } from "@/components/Sponsors";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="font-sans">
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Sponsors />
      <CTA />
      <Footer />
    </main>
  );
}