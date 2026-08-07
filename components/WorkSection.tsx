import PinnedStage from "./PinnedStage";
import RevolveIn from "./RevolveIn";
import { projects } from "@/lib/content";

export default function WorkSection() {
  return (
    <section id="work" className="work-section reveal-perspective">
      <RevolveIn className="section-intro">
        <p className="section-eyebrow">SELECTED WORK</p>
        <h2 className="section-heading">What I&apos;ve shipped</h2>
      </RevolveIn>
      <PinnedStage className="pinned-stage work-stage">
        {projects.map((project) => (
          <article key={project.title} className="project-card">
            <span className="project-card__tag">{project.tag}</span>
            <h3 className="project-card__title">{project.title}</h3>
            <p className="project-card__desc">{project.description}</p>
          </article>
        ))}
      </PinnedStage>
    </section>
  );
}
