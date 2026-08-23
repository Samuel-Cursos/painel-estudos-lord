import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("o sistema visual mantém textos legíveis e botões com contraste", async () => {
  const [styles, simulator] = await Promise.all([
    read("app/globals.css"),
    read("app/simulator.css"),
  ]);
  const fontSizes = [...`${styles}\n${simulator}`.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));

  assert.ok(fontSizes.length > 0);
  assert.ok(fontSizes.every((size) => size >= 9), "Há texto menor que 9 px e potencialmente invisível");
  assert.match(styles, /\.secondary\{color:var\(--ink\)\}/);
  assert.match(styles, /:focus-visible\{outline:3px solid/);
});

test("o layout móvel evita cortes e respeita a navegação inferior", async () => {
  const styles = await read("app/globals.css");

  assert.match(styles, /html \{[^}]*overflow-x:hidden/);
  assert.match(styles, /\.page-content\{overflow-x:clip\}/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /\.mobile-nav\{[^}]*overflow-x:auto/);
  assert.match(styles, /\.page-content,\.page-content>\*,\.workspace/);
});
