import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CanetaOS",
    short_name: "CanetaOS",
    description:
      "Ferramenta de acompanhamento e educação para pessoas que utilizam medicamentos da classe GLP-1.",
    start_url: "/app",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#0f1b2b",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
    ],
  }
}
