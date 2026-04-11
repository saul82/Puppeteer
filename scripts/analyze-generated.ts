import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const pdfPath = resolve(
    process.cwd(),
    process.argv[2] || "output_elementary.pdf"
  );
  console.log(`Analyzing: ${pdfPath}\n`);

  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, disableFontFace: true })
    .promise;
  const totalPages = doc.numPages;
  console.log(`Total pages: ${totalPages}\n`);

  const targetPages = buildTargetPages(totalPages);
  console.log(`Analyzing pages: ${targetPages.join(", ")}\n`);
  console.log("=".repeat(80));

  for (const pageNum of targetPages) {
    await analyzePage(doc, pageNum);
  }
}

function buildTargetPages(totalPages: number): number[] {
  const explicit = [1, 2, 9, 10, 11, 12];
  const lastThree = Array.from(
    { length: 3 },
    (_, i) => totalPages - 2 + i
  ).filter((p) => p >= 1);
  const merged = [...new Set([...explicit, ...lastThree])].filter(
    (p) => p >= 1 && p <= totalPages
  );
  merged.sort((a, b) => a - b);
  return merged;
}

interface FontInfo {
  sizes: Map<number, string[]>; // fontSize -> sample snippets
  bold: boolean;
  italic: boolean;
  family: string;
}

async function analyzePage(doc: any, pageNum: number) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.0 });
  const textContent = await page.getTextContent();

  const fonts = new Map<string, FontInfo>();
  const yPositions: { y: number; text: string; fontSize: number }[] = [];

  for (const item of textContent.items) {
    if (!("str" in item) || !item.str.trim()) continue;

    const transform: number[] = item.transform;
    // transform is [scaleX, skewY, skewX, scaleY, translateX, translateY]
    const fontSize = Math.round(Math.abs(transform[3]) * 100) / 100;
    const fontName: string = item.fontName;
    const text: string = item.str;
    const y = transform[5];

    yPositions.push({ y, text: text.substring(0, 60), fontSize });

    const style = textContent.styles[fontName] || {};
    const family: string = style.fontFamily || "unknown";

    const nameLower = fontName.toLowerCase();
    const isBold =
      nameLower.includes("bold") ||
      nameLower.includes("700") ||
      nameLower.includes("black");
    const isItalic =
      nameLower.includes("italic") || nameLower.includes("oblique");

    if (!fonts.has(fontName)) {
      fonts.set(fontName, {
        sizes: new Map(),
        bold: isBold,
        italic: isItalic,
        family,
      });
    }

    const info = fonts.get(fontName)!;
    if (!info.sizes.has(fontSize)) {
      info.sizes.set(fontSize, []);
    }
    const samples = info.sizes.get(fontSize)!;
    if (samples.length < 3) {
      samples.push(text.substring(0, 80));
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log(`PAGE ${pageNum}  (${viewport.width.toFixed(1)} x ${viewport.height.toFixed(1)} pts)`);
  console.log("=".repeat(80));

  console.log(`\n  FONTS FOUND: ${fonts.size}`);
  for (const [name, info] of fonts) {
    const attrs = [
      info.bold ? "BOLD" : "",
      info.italic ? "ITALIC" : "",
    ]
      .filter(Boolean)
      .join(", ");

    console.log(`\n  Font: "${name}"`);
    console.log(`    Family: ${info.family}${attrs ? `  [${attrs}]` : ""}`);
    console.log(`    Sizes used:`);

    const sortedSizes = [...info.sizes.entries()].sort((a, b) => b[0] - a[0]);
    for (const [size, samples] of sortedSizes) {
      console.log(`      ${size} pt:`);
      for (const s of samples) {
        console.log(`        "${s}"`);
      }
    }
  }

  // Line spacing analysis
  if (yPositions.length > 1) {
    console.log(`\n  LINE SPACING ANALYSIS (by Y-coordinate deltas):`);

    // Sort by Y descending (PDF coordinate: origin at bottom-left, so top of page = higher Y)
    yPositions.sort((a, b) => b.y - a.y);

    const spacingBuckets = new Map<string, number[]>();

    for (let i = 0; i < yPositions.length - 1; i++) {
      const delta = Math.abs(yPositions[i].y - yPositions[i + 1].y);
      if (delta < 0.5 || delta > 100) continue; // skip same-line items and page jumps

      const rounded = Math.round(delta * 10) / 10;
      const key = `${rounded}`;
      if (!spacingBuckets.has(key)) spacingBuckets.set(key, []);
      spacingBuckets.get(key)!.push(delta);
    }

    const sorted = [...spacingBuckets.entries()].sort(
      (a, b) => b[1].length - a[1].length
    );

    console.log(`    ${"Delta (pt)".padEnd(14)} ${"Count".padEnd(8)} Sample lines`);
    console.log(`    ${"─".repeat(14)} ${"─".repeat(8)} ${"─".repeat(40)}`);

    for (const [key, deltas] of sorted.slice(0, 12)) {
      // find an example pair
      const targetDelta = parseFloat(key);
      let examplePair = "";
      for (let i = 0; i < yPositions.length - 1; i++) {
        const d = Math.abs(yPositions[i].y - yPositions[i + 1].y);
        const rounded = Math.round(d * 10) / 10;
        if (rounded === targetDelta) {
          examplePair = `"${yPositions[i].text.substring(0, 25)}" → "${yPositions[i + 1].text.substring(0, 25)}"`;
          break;
        }
      }
      console.log(
        `    ${key.padEnd(14)} ${String(deltas.length).padEnd(8)} ${examplePair}`
      );
    }
  }

  // Summary table of all unique font-size combos
  console.log(`\n  FONT SIZE SUMMARY:`);
  const allCombos: { font: string; size: number; bold: boolean; italic: boolean; sample: string }[] = [];
  for (const [name, info] of fonts) {
    for (const [size, samples] of info.sizes) {
      allCombos.push({
        font: name,
        size,
        bold: info.bold,
        italic: info.italic,
        sample: samples[0] || "",
      });
    }
  }
  allCombos.sort((a, b) => b.size - a.size);

  console.log(`    ${"Size".padEnd(10)} ${"Bold".padEnd(6)} ${"Ital".padEnd(6)} ${"Font".padEnd(35)} Sample`);
  console.log(`    ${"─".repeat(10)} ${"─".repeat(6)} ${"─".repeat(6)} ${"─".repeat(35)} ${"─".repeat(30)}`);
  for (const c of allCombos) {
    console.log(
      `    ${String(c.size + " pt").padEnd(10)} ${(c.bold ? "YES" : "no").padEnd(6)} ${(c.italic ? "YES" : "no").padEnd(6)} ${c.font.substring(0, 35).padEnd(35)} ${c.sample.substring(0, 40)}`
    );
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
