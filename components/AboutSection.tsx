import RevolveIn from "./RevolveIn";
import { about } from "@/lib/content";

export default function AboutSection() {
  return (
    <section id="about" className="about-section reveal-perspective">
      <RevolveIn className="section-intro">
        <p className="section-eyebrow">ABOUT</p>
        <h2 className="section-heading">{about.heading}</h2>
      </RevolveIn>
      <RevolveIn className="about-body" axis="y" delay={0.05}>
        <p className="about-bio">{about.body}</p>
        <ul className="about-skills">
          {about.skills.map((skill) => (
            <li key={skill} className="about-skills__item">
              {skill}
            </li>
          ))}
        </ul>
      </RevolveIn>
    </section>
  );
}
