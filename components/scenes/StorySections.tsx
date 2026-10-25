"use client";

import { CSSProperties } from "react";
import { CT_COMPONENTS } from "@/components/scanner/config";
import { useExperience } from "@/components/experience/ExperienceContext";

const scenes = [
  { id: "hero", number: "01", title: <>COMPUTED<br />TOMOGRAPHY</>, body: "An X-ray sees through you. A CT scanner sees around you. Follow a beam from its source to the cross-sections that reveal a hidden world.", meta: "SCROLL TO BEGIN ↓" },
  { id: "intro", number: "02", title: <>ONE MACHINE.<br />THREE SYSTEMS.</>, body: "The gantry holds the imaging system. The table moves the patient through its opening. Inside, a source and detector turn together: one sends, one measures.", meta: "GANTRY · TABLE · ROTATION" },
  { id: "explode", number: "03", title: <>UNDER<br />THE SHELL</>, body: "The calm exterior hides a coordinated machine. Peel back the housing to find the rotating ring, X-ray tube, and curved detector array.", meta: "ASSEMBLY / EXPLODED" },
  { id: "gantry", number: "04", title: <>THE ROTATING<br />GANTRY</>, body: "One view flattens depth. Turn the source and detector around the patient, and overlapping structures leave different signatures at each angle.", meta: "360° ACQUISITION" },
  { id: "xray", number: "05", title: <>X-RAY<br />SOURCE</>, body: "A fan-shaped beam spreads from the tube toward the detector. As the ring turns, the beam traces new paths through the same anatomy.", meta: "X-RAYS VISUALIZED · ROTATION SLOWED" },
  { id: "attenuation", number: "06", title: <>THROUGH<br />THE BODY</>, body: "Every path leaves a signature. Air lets more X-rays through; bone lets fewer through. The detector measures what remains after the whole journey.", meta: "I = I₀ e^(−μx)" },
  { id: "detector", number: "07", title: <>MEASURED<br />IN LIGHT</>, body: "In the illustrated detector, a scintillator turns incoming X-rays into light. Electronics convert that light into a digital measurement for each channel.", meta: "DETECTOR ARRAY" },
  { id: "projection", number: "08", title: <>ONE ANGLE.<br />ONE PROJECTION.</>, body: "One angle gives one profile across the detector. Repeat around the body and the profiles change. Together, those views constrain what can be inside.", meta: "0° · 45° · 90° · 135° · 180°" },
  { id: "sinogram", number: "09", title: <>DATA<br />IN MOTION</>, body: "Stack the profiles by angle. A structure traces a curved path as its position shifts across the detector. This sinogram is organized measurement data, not yet anatomy.", meta: "DETECTOR POSITION × ACQUISITION ANGLE" },
  { id: "reconstruction", number: "10", title: <>FROM SIGNAL<br />TO 3D VOLUME</>, body: "Reconstruction combines measurements from many directions to estimate each cross-section. Watch these synthetic slices resolve, then gather into a volume you can look through.", meta: "SYNTHETIC ANATOMY · RECONSTRUCTION ILLUSTRATED" },
] as const;

const signalSteps = ["X-ray beam", "Measurement", "Sinogram", "Volume"];

function SignalJourney({ sceneId }: { sceneId: string }) {
  const { reducedMotion } = useExperience();
  const step = sceneId === "reconstruction" ? 3 : sceneId === "sinogram" ? 2 : ["detector", "projection"].includes(sceneId) ? 1 : 0;
  const style = reducedMotion ? { "--signal-fill": step / 3 } as CSSProperties : undefined;
  return (
    <figure style={style} className="signal-journey" aria-label="From X-ray beam to reconstructed volume">
      <svg viewBox="0 0 360 60" fill="none" aria-hidden="true">
        <path className="signal-track" d="M20 30H340" />
        <path className="signal-fill" pathLength="1" d="M20 30H340" />
        <g className={step === 0 ? "signal-node current" : "signal-node"}>
          <path d="M10 23L32 12M10 30H34M10 37L32 48" />
        </g>
        <g className={step === 1 ? "signal-node current" : "signal-node"}>
          <path d="M110 42V24M117 42V16M124 42V31M131 42V22M138 42V35" />
        </g>
        <g className={step === 2 ? "signal-node current" : "signal-node"}>
          <path d="M218 14H244V46H218ZM220 20C240 20 220 40 242 40M220 27C240 27 220 34 242 34" />
        </g>
        <g className={step === 3 ? "signal-node current" : "signal-node"}>
          <path d="M324 20H346V46H324ZM328 15H350V41M332 10H354V36" />
        </g>
      </svg>
      <figcaption>{signalSteps.map((label, index) => <span key={label} aria-current={index === step ? "step" : undefined}>{label}</span>)}</figcaption>
    </figure>
  );
}

export function StorySections() {
  return (
    <main id="top" className="story">
      {scenes.map((scene, index) => (
        <section key={scene.id} id={scene.id} className="story-section">
          <div className="story-copy">
            <div className="scene-number"><span>{scene.number}</span><i /></div>
            {index === 0 ? <h1>{scene.title}</h1> : <h2>{scene.title}</h2>}
            <p>{scene.body}</p>
            <small>{scene.meta}</small>
            {["xray", "attenuation", "detector", "projection", "sinogram", "reconstruction"].includes(scene.id) && <SignalJourney sceneId={scene.id} />}
          </div>
        </section>
      ))}
      <section id="reassembly" className="story-section" aria-label="Scanner reassembly">
        <div className="story-copy">
          <div className="scene-number"><span>11</span><i /></div>
          <h2>EVERY PART.<br />ONE PICTURE.</h2>
          <p>A source, a detector, a moving table, and reconstruction software. Each has a different job. Together, they turn invisible paths into a view inside.</p>
          <small>SCROLL ON TO EXPLORE EACH SYSTEM</small>
        </div>
      </section>
      <ExplorerSection />
    </main>
  );
}

function ExplorerSection() {
  const { selected, setSelected } = useExperience();
  const selectedComponent = CT_COMPONENTS.find((component) => component.id === selected);
  return (
    <section id="explorer" className="story-section explorer-section">
      <div className="story-copy explorer-copy">
        <div className="scene-number"><span>12</span><i /></div>
        <h2>EXPLORE THE<br />SCANNER</h2>
        <p>Drag to rotate. Scroll to zoom. Select a component to isolate its role.</p>
        <div className="component-list" role="list" aria-label="CT scanner components">
          {CT_COMPONENTS.map((component) => (
            <button
              key={component.id}
              type="button"
              className={selected === component.id ? "active" : ""}
              aria-pressed={selected === component.id}
              onClick={() => setSelected(selected === component.id ? null : component.id)}
            >
              <span>{component.label}</span><b>↗</b>
            </button>
          ))}
        </div>
        <div aria-live="polite" aria-atomic="true" className={selectedComponent ? "component-detail active" : "component-detail"}>
          <small>SELECTED COMPONENT</small>
          <strong>{selectedComponent?.label ?? "Select a component"}</strong>
          <p>{selectedComponent?.description ?? "Choose a system from the list or directly on the model."}</p>
        </div>
      </div>
    </section>
  );
}
