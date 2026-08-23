export type ExamAreaId = "lc" | "ch" | "cn" | "math";

export type OfficialExamArea = {
  id: ExamAreaId;
  label: string;
  start: number;
  end: number;
  day: 1 | 2;
};

export type OfficialExamEdition = {
  year: number;
  bookletUrls: [string, string];
  officialKeyUrls: [string, string];
  answerKey: string;
  spanishAnswers: Record<string, string>;
  areas: OfficialExamArea[];
};

export const officialExamSimulations: Record<number, OfficialExamEdition> = {
  2011: {
    year: 2011,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/075197bb-201c-4a11-a9c7-f9422de5c1fb/download", "https://riep.inep.gov.br/bitstreams/d9900fe8-9640-486b-9e5f-6e6ec62fa5ca/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/afafa323-1254-43c5-b81f-b8f2804824eb/download", "https://riep.inep.gov.br/bitstreams/8a5e8f2a-0f85-4ffb-8a53-b8817d5eadfa/download"],
    answerKey: "EDEECBDDABAAEABCDECEDCACBBCCDAAEBDDADDBBAEACAADCECDEBABCCEABBCECAEDEABDAEDBBDDBEDCDACBBCADEEDBDEDDDACDEBBECAACDABADBAECCEADDCEBCBACBAEEBAEEECCEEEBCBECEBADCBDBEADCDBDCCCBADCAECCCCDD",
    spanishAnswers: {"91":"B","92":"D","93":"D","94":"C","95":"A"},
    areas: [{"id":"ch","label":"Ciências Humanas","start":1,"end":45,"day":1},{"id":"cn","label":"Ciências da Natureza","start":46,"end":90,"day":1},{"id":"lc","label":"Linguagens","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
  2012: {
    year: 2012,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/82fe5a3b-19ac-45af-ae3b-ca994ed36798/download", "https://riep.inep.gov.br/bitstreams/f16b58a3-d49c-4e34-891f-160474c06b6d/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/e4f7f80b-c3b3-4341-a4f1-04bdd1718376/download", "https://riep.inep.gov.br/bitstreams/97e3e0d1-ff01-40a6-b8f6-fdd7502133fa/download"],
    answerKey: "CEBECAEAAABDDBCDCEEEEECEBDDCCDAADAEEABEEEDAECCBABDDACEEDABAEBEEAECEACBDDABEBEBBACEBECCCDCDDBBADAAAEBEBEEAEADAABDDCEDECDABEACBDBADEDAADAADEDEABEEECCCBDEDACBDCABADEBDAEEDBDDECDBCBEDB",
    spanishAnswers: {"91":"D","92":"A","93":"A","94":"B","95":"C"},
    areas: [{"id":"ch","label":"Ciências Humanas","start":1,"end":45,"day":1},{"id":"cn","label":"Ciências da Natureza","start":46,"end":90,"day":1},{"id":"lc","label":"Linguagens","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
  2013: {
    year: 2013,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/9e1a999d-f8af-44b4-a2c3-c4b0ac6c0233/download", "https://riep.inep.gov.br/bitstreams/2b500006-b56d-4281-8848-7f92a56952d6/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/9332ddbb-5cba-454d-87ae-88f9796394ae/download", "https://riep.inep.gov.br/bitstreams/2a673326-16cc-477a-8130-2e6930fd8f55/download"],
    answerKey: "BEDBCCBEAACCACDEABBBCBCDDBDABCAEECCACEBABCBACABAABCBCBEBDBBEDAABCEAEACBECDDBAABCECDDBBDBAACCABCACAAEACDDBDEBCBCCEECEDDABEDEEACCDABBEDBEEDBCAAECAABBBDCECDDAEBACEBECBDADEDCDCBCBADCDE",
    spanishAnswers: {"91":"E","92":"A","93":"B","94":"C","95":"C"},
    areas: [{"id":"ch","label":"Ciências Humanas","start":1,"end":45,"day":1},{"id":"cn","label":"Ciências da Natureza","start":46,"end":90,"day":1},{"id":"lc","label":"Linguagens","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
  2014: {
    year: 2014,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/a94c4964-e3b6-43d7-bdf4-854470236f71/download", "https://riep.inep.gov.br/bitstreams/57769e79-f2bc-4d4a-8cde-3b2c71149627/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/26a70e0f-7e6b-4d8c-8def-b86db524d627/download", "https://riep.inep.gov.br/bitstreams/d86743dc-d490-4d28-adf3-7337f7d92305/download"],
    answerKey: "AADEAABBEADBABBDADBCCEECCEDECBCABDBACCEDEADECDAEDCDCAEABDBCBDEADCDBEBCBDCBEECABDABADBDEDEACDACABCBCDCBEBCECDEBACAEBDCDEDBCABBCBCDABDADDDDCDEECBBEDBBDABBCCBCCEDEAECAEADDCDAABABDCECA",
    spanishAnswers: {"91":"A","92":"A","93":"D","94":"E","95":"C"},
    areas: [{"id":"ch","label":"Ciências Humanas","start":1,"end":45,"day":1},{"id":"cn","label":"Ciências da Natureza","start":46,"end":90,"day":1},{"id":"lc","label":"Linguagens","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
  2015: {
    year: 2015,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/ef8c934f-43e7-4a86-9955-f1d47e192cd3/download", "https://riep.inep.gov.br/bitstreams/7fdb80bb-f54c-4e5c-a41a-d810bdb5a9da/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/2d63688b-dedc-4faf-80f9-019db47fd93d/download", "https://riep.inep.gov.br/bitstreams/0c524774-8525-448f-a98c-e5162aac1ebb/download"],
    answerKey: "DADCCABDEACBCEEDECBABBCEBCDECBBEADBDAAEAEADECAEDCADBCABCCBBBBEEDCEAABECBDDCCDEAEEDEDAADBCACDEAABDEBECECCDBBEBEABBABDCDADEEDCDAECCABBDCEDBBBADCADAEAEDCADCBECAAEDACCCEBDECABDBEEDEBCC",
    spanishAnswers: {"91":"D","92":"C","93":"D","94":"B","95":"A"},
    areas: [{"id":"ch","label":"Ciências Humanas","start":1,"end":45,"day":1},{"id":"cn","label":"Ciências da Natureza","start":46,"end":90,"day":1},{"id":"lc","label":"Linguagens","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
  2016: {
    year: 2016,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/dcb0d85d-5da4-48ee-b49a-e34db65c9c8b/download", "https://riep.inep.gov.br/bitstreams/b2b444d8-dd24-4e19-89b6-7c629e4c40ff/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/178f4a17-af6a-469f-89f5-1400c64cf043/download", "https://riep.inep.gov.br/bitstreams/ea4f9461-71cb-4dbf-b5e8-a68d6e7e102b/download"],
    answerKey: "EEBCBCEDDBDDACCCBCADADBAADEDDADCECAECBBBADCECDBDCCACADBADBCABDEBEECECDDBCADCCBEBBEDBEAEACADECEADADEBABEAAEDCBCABDCEBADCEBAAECBBCBDABEBBCBAACCEABDDCDBDDCEAECADBECEBACBDABDBEBCDADCEE",
    spanishAnswers: {"91":"C","92":"C","93":"E","94":"B","95":"B"},
    areas: [{"id":"ch","label":"Ciências Humanas","start":1,"end":45,"day":1},{"id":"cn","label":"Ciências da Natureza","start":46,"end":90,"day":1},{"id":"lc","label":"Linguagens","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
  2017: {
    year: 2017,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/68354e24-fce6-4f84-8e71-82a90d9d3229/download", "https://riep.inep.gov.br/bitstreams/d98168a5-c580-423b-a0c0-df55cb79c8af/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/aafa2a97-ddff-40a4-8087-caf416569f50/download", "https://riep.inep.gov.br/bitstreams/f46699fc-5303-49c5-af88-5922e55189b9/download"],
    answerKey: "EDDCDCCEBDAEDAEDAABEDBBADEDEDDABAABBDCBEABBCCCDEAEECAEBDBDBBAECDAEBCCCDAEBEABDBEDAADBCDDECBCBBEBAAEDDCBDADEEBADECDCBCDAAEABCEEAAECDCCDACCECEECDADBBDBBDBAEBDDABECBDCCDEDBBACAEADAEAC",
    spanishAnswers: {"1":"B","2":"E","3":"E","4":"D","5":"E"},
    areas: [{"id":"lc","label":"Linguagens","start":1,"end":45,"day":1},{"id":"ch","label":"Ciências Humanas","start":46,"end":90,"day":1},{"id":"cn","label":"Ciências da Natureza","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
  2018: {
    year: 2018,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/7287a7af-b8a1-46dd-900a-3e9b45de386b/download", "https://riep.inep.gov.br/bitstreams/eef2de95-259a-4ddd-ba29-9c03695623e1/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/2eb9440d-6d3c-48c2-9747-d9235b056e3b/download", "https://riep.inep.gov.br/bitstreams/258048d1-b6a0-451e-95ac-28ca1ddf9922/download"],
    answerKey: "BBEDCBBEADECACEDBEADABEDBABAECCBEABDDBACDCECBAEECDECBEBDCACDEDEEDBDDEBCECDECAABEDBEBBEBECCBCACEEBBBDACEDECAADDDABDBCCACDCBCEDEDABEBEAEAADAEDABBCAADBEAEBBDEEADCCCCDACEDDABCBCAAEBBDD",
    spanishAnswers: {"1":"C","2":"B","3":"B","4":"D","5":"B"},
    areas: [{"id":"lc","label":"Linguagens","start":1,"end":45,"day":1},{"id":"ch","label":"Ciências Humanas","start":46,"end":90,"day":1},{"id":"cn","label":"Ciências da Natureza","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
  2019: {
    year: 2019,
    bookletUrls: ["https://riep.inep.gov.br/bitstreams/ef59158b-11f9-4bf7-a9fc-64d801cd06e7/download", "https://riep.inep.gov.br/bitstreams/83cc051d-2bc9-4894-8690-dd9f24b1fb2e/download"],
    officialKeyUrls: ["https://riep.inep.gov.br/bitstreams/3abcf776-6e65-49e4-8643-dd60dab28f48/download", "https://riep.inep.gov.br/bitstreams/4bbfd08c-5f81-4148-a8df-deb876ea296a/download"],
    answerKey: "BBEDACBABAECBBCCADCEBDBBCDDEEAAADDBECDECAAECDCBABADBBCEEEBCBADCBEEDBBEADBBACDBBACCCCADACACBEEAAEBEEBADEADDADAEABCEDDDBCBCBCCACBCDADCCEBBEDEEEAADBEBACABCDBABECECACADCBDCCEDCDABECDDD",
    spanishAnswers: {"1":"B","2":"D","3":"A","4":"C","5":"A"},
    areas: [{"id":"lc","label":"Linguagens","start":1,"end":45,"day":1},{"id":"ch","label":"Ciências Humanas","start":46,"end":90,"day":1},{"id":"cn","label":"Ciências da Natureza","start":91,"end":135,"day":2},{"id":"math","label":"Matemática","start":136,"end":180,"day":2}],
  },
};

export const officialSimulatorYears = Object.keys(officialExamSimulations)
  .map(Number)
  .sort((a, b) => b - a);

export function officialAnswerFor(edition: OfficialExamEdition, question: number, language: "english" | "spanish") {
  if (language === "spanish" && edition.spanishAnswers[String(question)]) return edition.spanishAnswers[String(question)];
  return edition.answerKey[question - 1] ?? "";
}

