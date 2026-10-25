"use client";

import { CT_COMPONENTS } from "@/components/scanner/config";
import { useExperience } from "@/components/experience/ExperienceContext";

const scenes = [
  { id: "hero", number: "01", title: <>COMPUTED<br />TOMOGRAPHY</>, body: "Take the machine apart. Follow the signal. See how a scan becomes an image.", meta: "SCROLL TO BEGIN ↓" },
  { id: "intro", number: "02", title: <>ONE MACHINE.<br />THREE SYSTEMS.</>, body: "A gantry, a moving table, and a rotating imaging system work as one.", meta: "GANTRY · TABLE · ROTATION" },
  { id: "explode", number: "03", title: <>UNDER<br />THE SHELL</>, body: "The outer housing separates to reveal the components carrying the scan.", meta: "ASSEMBLY / EXPLODED" },
  { id: "gantry", number: "04", title: <>THE ROTATING<br />GANTRY</>, body: "Source and detector orbit together, collecting measurements from every angle.", meta: "360° ACQUISITION" },
  { id: "xray", number: "05", title: <>X-RAY<br />SOURCE</>, body: "A rotating X-ray tube produces radiation from multiple angles around the patient.", meta: "X-RAYS VISUALIZED · ROTATION SLOWED" },
  { id: "attenuation", number: "06", title: <>THROUGH<br />THE BODY</>, body: "Tissues attenuate the beam differently. Dense structures absorb more; air absorbs less.", meta: "I = I₀ e^(−μx)" },
  { id: "detector", number: "07", title: <>MEASURED<br />IN LIGHT</>, body: "The detector records how much radiation reaches each individual element.", meta: "DETECTOR ARRAY" },
  { id: "projection", number: "08", title: <>ONE ANGLE.<br />ONE PROJECTION.</>, body: "Each rotation produces hundreds of views: narrow records of attenuation across the body.", meta: "0° · 45° · 90° · 135° · 180°" },
  { id: "sinogram", number: "09", title: <>DATA<br />IN MOTION</>, body: "Each row records the detector readings at one angle. Stack the rows to build a sinogram.", meta: "DETECTOR POSITION × ACQUISITION ANGLE" },
  { id: "reconstruction", number: "10", title: <>FROM SIGNAL<br />TO SLICE</>, body: "Reconstruction combines the measurements until internal structure resolves into a cross-section.", meta: "AXIAL SLICES · SIMULATED ANATOMY" },
] as const;

export function StorySections() {
  return (
    <main id="top" className="story">
      {scenes.map((scene, index) => (
        <section key={scene.id} id={scene.id} className={`story-section ${index % 3 === 1 ? "align-right" : ""}`}>
          <div className="story-copy">
            <div className="scene-number"><span>{scene.number}</span><i /></div>
            {index === 0 ? <h1>{scene.title}</h1> : <h2>{scene.title}</h2>}
            <p>{scene.body}</p>
            <small>{scene.meta}</small>
          </div>
        </section>
      ))}
      <section id="reassembly" className="story-section" aria-label="Scanner reassembly" />
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
        <div className={selectedComponent ? "component-detail active" : "component-detail"}>
          <small>SELECTED COMPONENT</small>
          <strong>{selectedComponent?.label ?? "Select a component"}</strong>
          <p>{selectedComponent?.description ?? "Choose a system from the list or directly on the model."}</p>
        </div>
      </div>
    </section>
  );
}
