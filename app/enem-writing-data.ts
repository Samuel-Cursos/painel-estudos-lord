export type EnemWritingPrompt = {
  year: number;
  theme: string;
  page: number;
  sourceUrl: string;
  pdfUrl: string;
  fallbackPdfUrl?: string;
};

// Aplicação regular impressa, primeiro dia. O leitor abre o caderno oficial do RIEP/Inep.
// Conferido em 07/09/2026. Não inclui reaplicação, PPL, digital ou aplicação especial.
export const enemWritingPrompts: EnemWritingPrompt[] = [
  { year: 2025, theme: "Perspectivas acerca do envelhecimento na sociedade brasileira", page: 20,
    sourceUrl: "https://riep.inep.gov.br/items/ca4bcb51-f523-495b-8b49-704c0f155ba8",
    pdfUrl: "https://riep.inep.gov.br/server/api/core/bitstreams/a11f89c6-3693-49f0-8164-2794b5dac372/content" },
  { year: 2024, theme: "Desafios para a valorização da herança africana no Brasil", page: 19,
    sourceUrl: "https://riep.inep.gov.br/items/ef756e8a-327c-489e-bd10-24324aa9d3f5",
    pdfUrl: "https://riep.inep.gov.br/server/api/core/bitstreams/71aaf57d-a5b7-4300-bd8b-fcf2ec490570/content" },
  { year: 2023, theme: "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil", page: 19,
    sourceUrl: "https://riep.inep.gov.br/items/75be0df5-ba4c-42fa-9bec-347f92130afb",
    pdfUrl: "https://riep.inep.gov.br/server/api/core/bitstreams/6f6e6a08-9f0b-4365-9f52-a24c5e4ab2e7/content" },
  { year: 2022, theme: "Desafios para a valorização de comunidades e povos tradicionais no Brasil", page: 20,
    sourceUrl: "https://riep.inep.gov.br/items/56e52b5e-9782-4b09-aa4c-51f38d72497a",
    pdfUrl: "https://riep.inep.gov.br/server/api/core/bitstreams/7d656252-c499-42dc-93c9-ea825cce7a0e/content" },
  { year: 2021, theme: "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil", page: 21,
    sourceUrl: "https://riep.inep.gov.br/items/0ccca9ce-dfec-4dde-9c05-c5a1ddd6c467",
    pdfUrl: "https://riep.inep.gov.br/server/api/core/bitstreams/0ec029ac-140b-424a-9c62-f96095c25d3c/content",
    // Cópia integral: MD5 a3e9f676b464f1f58df067074a4fd18c, idêntico ao checksum do RIEP.
    fallbackPdfUrl: "https://s1.static.brasilescola.uol.com.br/enem/2021/12/caderno-amarelo.pdf" },
  { year: 2020, theme: "O estigma associado às doenças mentais na sociedade brasileira", page: 19,
    sourceUrl: "https://riep.inep.gov.br/items/6a7da4e2-05ec-4b66-ba66-ef53a539e26f",
    pdfUrl: "https://riep.inep.gov.br/server/api/core/bitstreams/c7f9eb38-a261-4c58-a1f0-21b68d7be34e/content" },
];

export function getEnemWritingPrompt(year: number) {
  return enemWritingPrompts.find((prompt) => prompt.year === year);
}
