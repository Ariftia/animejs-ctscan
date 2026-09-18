import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inside a CT Scanner — Interactive Computed Tomography Experience",
  description:
    "Explore how computed tomography works through an interactive 3D journey from X-ray generation and detector measurements to projection data and image reconstruction.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f1eb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
