/**
 * Single source of truth for site copy. Everything here is a clearly
 * marked placeholder — swap values, not structure, once real content
 * (project write-ups, resume, images) is ready.
 */

export const site = {
  name: "Vanam Thrishul",
  role: "Software Engineer", // PLACEHOLDER — confirm real title
  location: "India", // PLACEHOLDER
};

export const hero = {
  eyebrow: `${site.name.toUpperCase()} · PORTFOLIO 2026`,
  headline: "Code that moves.", // PLACEHOLDER
  sub: "Software engineering with a bias for motion — realtime systems, tactile interfaces, and graphics that earn their keep.", // PLACEHOLDER
  primaryCta: { label: "View selected work", href: "#work" },
  secondaryCta: { label: "Get in touch", href: "#contact" },
  stats: [
    { value: 40, suffix: "M+", label: "events processed / day" }, // PLACEHOLDER
    { value: 99.99, suffix: "%", label: "uptime, three platforms" }, // PLACEHOLDER
    { value: 6, suffix: "", label: "product teams shipped to" }, // PLACEHOLDER
  ],
};

export type Project = {
  tag: string;
  title: string;
  description: string;
};

export const projects: Project[] = [
  { tag: "DATA PLATFORM", title: "Nova", description: "Realtime pipeline processing 40M events/day with sub-second latency." }, // PLACEHOLDER
  { tag: "DESIGN SYSTEMS", title: "Aperture", description: "A token-driven component library adopted across six product teams." }, // PLACEHOLDER
  { tag: "APPLIED ML", title: "Continuum", description: "An assistant that reads a codebase and explains its own architecture." }, // PLACEHOLDER
];

export const about = {
  heading: "About", // PLACEHOLDER
  body: "A short bio goes here — background, what you focus on, and how you like to work. Replace this paragraph with the real thing.", // PLACEHOLDER
  skills: ["TypeScript", "React", "Node.js", "Systems Design", "WebGL"], // PLACEHOLDER
};

export const contact = {
  heading: "Let's talk", // PLACEHOLDER
  body: "Open to interesting problems and good teams. Reach out.", // PLACEHOLDER
  email: "thrishulkrishna3@gmail.com",
  socials: [
    { label: "GitHub", href: "https://github.com/vanamthrishul" },
    { label: "LinkedIn", href: "https://linkedin.com/" }, // PLACEHOLDER — send me your profile URL
  ],
};
