# CT exterior references

Reviewed 2026-10-18. The exterior is an original educational illustration, not a dimensionally accurate replica of any manufacturer’s device.

- [Siemens Healthineers NAEOTOM Alpha](https://www.siemens-healthineers.com/en-us/computed-tomography/naeotom/naeotom-alpha): broad rounded enclosure, circular bore surround, bilateral operator panels, and integrated patient table.
- [GE HealthCare Revolution Apex](https://www.gehealthcare.com/en/products/computed-tomography/revolution/apex-platform): compact clinical enclosure, recessed bore, restrained material transitions, and long patient support.

Implementation: `components/scanner/ProductExterior.tsx`. Smooth beveled enclosure with an open bore, teal trim, geometric operator displays and physical controls, side vents, dark patient pad, metal guide rails, and a pedestal base. Teal follows this experience’s existing palette. No manufacturer logos, images, or downloaded meshes are incorporated. Existing GLB assets remain available in `public/models`; the exterior now uses native Three.js geometry and adds no asset downloads.
