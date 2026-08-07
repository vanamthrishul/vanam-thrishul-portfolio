import Hero from "@/components/Hero";
import WorkSection from "@/components/WorkSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <main className="relative z-10 flex-1">
      <Hero />
      <WorkSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
