import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RoseDen OS",
    short_name: "RoseDen",
    description: "Mobile business operations for RoseDen Atelier.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#F8F2E8",
    theme_color: "#5A1020",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/roseden-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/roseden-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
