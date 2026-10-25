"use client";

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
  { id: "reconstruction", number: "10", title: <>FROM SIGNAL<br />TO 3D VOLUME</>, body: "Reconstruction combines measurements from many directions to estimate each cross-section. These synthetic slices reveal the same body, lung regions, and spine shown during acquisition.", meta: "SYNTHETIC ANATOMY · RECONSTRUCTION ILLUSTRATED" },
] as const;

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
  return (
    <section id="explorer" className="story-section explorer-section">
      <div className="story-copy explorer-copy">
        <div className="scene-number"><span>12</span><i /></div>
        <h2>EXPLORE THE<br />SCANNER</h2>
        <p>Drag to rotate. Scroll to zoom. Select a component to zoom in and expand its explanation.</p>
        <div className="component-list" role="list" aria-label="CT scanner components">
          {CT_COMPONENTS.map((component) => (
            <div key={component.id} className="component-row" role="listitem">
              <button
                id={`component-${component.id}`}
                type="button"
                className={selected === component.id ? "active" : ""}
                aria-expanded={selected === component.id}
                aria-controls={`detail-${component.id}`}
                onClick={() => setSelected(selected === component.id ? null : component.id)}
              >
                <span>{component.label}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" />
                  {selected !== component.id && <path d="M8 3V13" stroke="currentColor" strokeWidth="1.5" />}
                </svg>
              </button>
              <div id={`detail-${component.id}`} className="component-detail" role="region" aria-labelledby={`component-${component.id}`} hidden={selected !== component.id}>
                <p>{component.description}</p>
                <p>{component.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
