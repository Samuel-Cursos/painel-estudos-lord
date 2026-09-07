import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clareia | Preparação ENEM",
    short_name: "Clareia",
    description: "Plataforma Clareia para organização dos estudos, questões, simulados e provas do ENEM.",
    start_url: "/",
    display: "standalone",
    background_color: "#161b31",
    theme_color: "#161b31",
    icons: [
      {
        src: "/clareia-logo.png",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
