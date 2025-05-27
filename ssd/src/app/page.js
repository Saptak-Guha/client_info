// --- src/app/page.js ---
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OurSolution } from "@/components/OurSolution";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { Sponsors } from "@/components/Sponsors";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="font-sans">
      <Header/>
      <Hero />
      <OurSolution/>
      <Features />
      <Pricing />
      <Testimonials />
      <Sponsors />
      <CTA />
      <Footer />
    </main>
  );
}