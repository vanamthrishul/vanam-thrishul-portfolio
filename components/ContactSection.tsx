import RevolveIn from "./RevolveIn";
import MagneticButton from "./MagneticButton";
import { contact } from "@/lib/content";

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section reveal-perspective">
      <RevolveIn className="section-intro">
        <p className="section-eyebrow">CONTACT</p>
        <h2 className="section-heading">{contact.heading}</h2>
      </RevolveIn>
      <RevolveIn className="contact-body" axis="y" delay={0.05}>
        <p className="contact-blurb">{contact.body}</p>
        <div className="contact-cta-row">
          <MagneticButton href={`mailto:${contact.email}`} className="btn btn--solid">
            {contact.email}
          </MagneticButton>
        </div>
        <ul className="contact-socials">
          {contact.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="hover"
                className="contact-socials__link"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </RevolveIn>
    </section>
  );
}
