export type WritingObservation = { id: string; title: string; detail: string };

export function countWritingWords(text: string) {
  return (text.match(/[\p{L}\p{N}]+(?:['‚Äô-][\p{L}\p{N}]+)*/gu) ?? []).length;
}

// Alguns cadernos t√™m fontes sem mapeamento Unicode. N√£o mostrar nem comparar texto corrompido.
export function readablePdfText(text: string) {
  const invalid = (text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/g) ?? []).length;
  return countWritingWords(text) >= 30 && invalid <= text.length * 0.01;
}

/** Mechanical checks only: these do not assess the meaning of the essay or assign a grade. */
export function inspectWriting(text: string) {
  const paragraphs = text.trim().split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const sentences = text.trim().split(/[.!?]+(?:\s|$)/u).filter((part) => part.trim());
  const observations: WritingObservation[] = [];
  const words = countWritingWords(text);
  if (!words) return { words: 0, paragraphs: 0, observations };
  if (paragraphs.length === 1) observations.push({ id: "paragraphs", title: "O texto est√° em um √∫nico bloco", detail: "Confira onde come√ßam a introdu√ß√£o, o desenvolvimento e a conclus√£o. Se j√° organizou essas partes, separe os par√°grafos no editor." });
  const longSentences = sentences.filter((sentence) => countWritingWords(sentence) > 45).length;
  if (longSentences) observations.push({ id: "long-sentences", title: `${longSentences} per√≠odo(s) com mais de 45 palavras`, detail: "Releia esses per√≠odos e veja se a pontua√ß√£o pode tornar as ideias mais claras. √â uma sugest√£o de revis√£o, n√£o uma regra de pontua√ß√£o do ENEM." });
  const repeated = text.match(/(?<![\p{L}])([\p{L}]{2,})\s+\1(?![\p{L}])/giu);
  if (repeated?.length) observations.push({ id: "duplicates", title: "Poss√≠vel palavra duplicada", detail: `Confira: ${[...new Set(repeated)].slice(0, 4).join("; ")}. A repeti√ß√£o pode ser intencional; avalie no contexto.` });
  if (!/[.!?‚Ä¶][‚Äù"')\]]?\s*$/.test(text)) observations.push({ id: "ending", title: "Confira o final do texto", detail: "N√£o encontrei pontua√ß√£o de encerramento. Veja se terminou a conclus√£o ou se o texto ainda √© um rascunho." });
  return { words, paragraphs: paragraphs.length, observations };
}

export function findSupportOverlap(text: string, support: string, theme: string) {
  const normalize = (value: string) => (value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{M}/gu, "").match(/[\p{L}\p{N}]+/gu) ?? []);
  const sourceWords = normalize(support);
  const essayWords = normalize(text)=¥”æm¢Gß≤⁄Óù∆≠y÷ˆ<:÷ÊñÚ„¬˜„¬ˆFóc„¬ˆ'Fñ6∆S„¬ˆFóc„∆Fób6∆74Ê÷S“&6ÜB÷&˜Ç6∂ñ∆¬◊&ˆ◊B#„∆Fóc„«7G&ˆÊs‰÷VÁ6vV“&ˆÁF&Ú6ÜDuC¬˜7G&ˆÊs„«Ó(	≈VW&ÚW7GVF"∑6V∆V7FVE6∂ñ∆¬Á6∂ñ∆«“¬FÚL;7ñ6Ú∂Fó7∆ïF˜ñ2á6V∆V7FVE6∂ñ∆¬ó“V“∑7V&¶V7D'îñBá6V∆V7FVE6∂ñ∆¬Á7V&¶V7BíÊÊ÷W“‚Wá∆óVRFÚ¶W&Ú¬÷˜7G&RWÜV◊∆˜2RFWˆó2FW7FR÷WRFˆ‹:÷ÊñÚÓ(	”¬˜„¬ˆFóc„∆'WGFˆ‚ˆ‰6∆ñ6≥◊≤Çí”‚6˜ïFWáBÜVW&ÚW7GVF"G∑6V∆V7FVE6∂ñ∆¬Á6∂ñ∆«“¬FÚL;7ñ6ÚG∂Fó7∆ïF˜ñ2á6V∆V7FVE6∂ñ∆¬ó“V“G∑7V&¶V7D'îñBá6V∆V7FVE6∂ñ∆¬Á7V&¶V7BíÊÊ÷W“‚Wá∆óVRFÚ¶W&ÚV“∆ñÊwVvV“6ñ◊∆W2¬÷˜7G&RWÜV◊∆˜2RFWˆó2÷R76RWÜW&<:÷6ñ˜2w&GVó2Êó”‰6˜ñ"÷VÁ6vV”¬ˆ'WGFˆ„„¬ˆFócÁ∂Ü5VW7Fñˆ‰&Ê≤á6V∆V7FVE6∂ñ∆¬Á7V&¶V7Bíbb∆'WGFˆ‚6∆74Ê÷S“'VW7Fñˆ‚◊&V6ˆ÷÷VÊB÷'WGFˆ‚"ˆ‰6∆ñ6≥◊≤Çí”‚˜VÂVW7Fñˆ‰f˜%6∂ñ∆¬á6V∆V7FVE6∂ñ∆¬ó”„«7„„Û¬˜7„„∆Fóc„«7G&ˆÊsÂ&W6ˆ«fW"V÷VW7L:6ÚFW7FR77VÁFÛ¬˜7G&ˆÊs„«6÷∆√‰Ú6FW&ÊÚW66ˆ∆ÜRV÷VRfˆ<:¢ñÊFÏ:6Ú&W7ˆÊFWR„¬˜6÷∆√„¬ˆFóc„∆#Ó(i#¬ˆ#„¬ˆ'WGFˆ„Á”∆Fób6∆74Ê÷S“&÷ˆF¬◊7FvR÷7FñˆÁ2#Á∑7FvW2Ê÷Çá7FvRí”‚∆'WGFˆ‚∂Wì◊∑7FvRÊñG“6∆74Ê÷S◊∑6∂ñ∆≈&ˆw&W75∑6V∆V7FVE6∂ñ∆¬ÊñE”ÚÂ∑7FvRÊñE“Ú&FˆÊR"¢"'“ˆ‰6∆ñ6≥◊≤Çí”‚&WVW7E6∂ñ∆≈7FvRá6V∆V7FVE6∂ñ∆¬¬7FvRÊñBó”„«7„Á∑6∂ñ∆≈&ˆw&W75∑6V∆V7FVE6∂ñ∆¬ÊñE”ÚÂ∑7FvRÊñE“Ú.)…2"¢7FvRÁ6Ü˜'G”¬˜7„Á∑7FvRÊ∆&V«”¬ˆ'WGFˆ„‚ó”¬ˆFóc„¬˜6V7Fñˆ„„¬ˆFócÁ–¢∂÷7FW'î∆W76ˆ‚bb∆W76ˆ‰÷7FW'ï∂÷7FW'î∆W76ˆ‚ÊñE“bbƒ÷7FW'î6ÜV6≤VW7Fñˆ„◊∂∆W76ˆ‰÷7FW'ï∂÷7FW'î∆W76ˆ‚ÊñE◊“FóF∆S◊∂ñÊvÃ:ß2+rG∂÷7FW'î∆W76ˆ‚ÁFóF∆W÷“ˆ‰6∆˜6S◊≤Çí”‚6WD÷7FW'î∆W76ˆ‚ÜÁV∆¬ó“ˆÂ73◊≤Çí”‚≤6WD∆W76ˆÂ7FGW2Ü÷7FW'î∆W76ˆ‚¬&FˆÊR"ì≤6WD÷7FW'î∆W76ˆ‚ÜÁV∆¬ì≤6WE6V∆V7FVD∆W76ˆ‚ÜÁV∆¬ì≤◊“ÛÁ–¢∂÷7FW'ï6∂ñ∆¬bbƒ÷7FW'î6ÜV6≤VW7Fñˆ„◊∑6∂ñ∆ƒ÷7FW'ïVW7Fñˆ‚Ü÷7FW'ï6∂ñ∆¬Á7V&¶V7B¬÷7FW'ï6∂ñ∆¬Á6∂ñ∆¬ó“FóF∆S◊∂G∑7V&¶V7D'îñBÜ÷7FW'ï6∂ñ∆¬Á7V&¶V7BíÊÊ÷W“+rG∂÷7FW'ï6∂ñ∆¬Á6∂ñ∆«÷“ˆ‰6∆˜6S◊≤Çí”‚6WD÷7FW'ï6∂ñ∆¬ÜÁV∆¬ó“ˆÂ73◊≤Çí”‚≤Fˆvv∆U6∂ñ∆≈7FvRÜ÷7FW'ï6∂ñ∆¬¬&÷7FW'í"ì≤6WD÷7FW'ï6∂ñ∆¬ÜÁV∆¬ì≤6WE6V∆V7FVE6∂ñ∆¬ÜÁV∆¬ì≤◊“ÛÁ–¢∂∆ˆFñÊrbb∆Fób6∆74Ê÷S“&∆ˆFñÊr◊67&VV‚#„∆Fób6∆74Ê÷S“&∆ˆFW""Û„«7„‰˜&vÊó¶ÊFÚ7V&W&:|:6Ú‚‚„¬˜7„„¬ˆFócÁ–¢¬ˆ÷ñ„„∞ß–