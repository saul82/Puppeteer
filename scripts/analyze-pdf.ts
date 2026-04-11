import { resolve, join } from 'path';
import { pathToFileURL } from 'url';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

GlobalWorkerOptions.workerSrc = pathToFileURL(
  join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'),
).href;

interface FontInfo {
  fontName: string;
  sizes: Map<number, string[]>; // size -> sample snippets
  bold: boolean;
  italic: boolean;
}

interface LineGap {
  y1: number;
  y2: number;
  gap: number;
  text1: string;
  text2: string;
}

async function analyzePage(pdf: any, pageNum: number) {
  const page = await pdf.getPage(pageNum);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });

  const fonts = new Map<string, FontInfo>();
  const textItems: { y: number; height: number; text: string; fontName: string; fontSize: number }[] = [];

  for (const item of textContent.items) {
    if (!('str' in item) || !item.str.trim()) continue;

    const fontName: string = item.fontName || 'unknown';
    const transform: number[] = item.transform || [];

    // transform[0] and transform[3] encode horizontal/vertical scale (≈ font size in PDF units)
    const rawHeight = Math.abs(transform[3] || item.height || 0);
    const fontSize = Math.round(rawHeight * 100) / 100;
    const y = transform[5] ?? 0;

    const isBold = /bold/i.test(fontName);
    const isItalic = /italic|oblique/i.test(fontName);

    if (!fonts.has(fontName)) {
      fonts.set(fontName, { fontName, sizes: new Map(), bold: isBold, italic: isItalic });
    }
    const fi = fonts.get(fontName)!;
    if (!fi.sizes.has(fontSize)) {
      fi.sizes.set(fontSize, []);
    }
    const samples = fi.sizes.get(fontSize)!;
    if (samples.length < 3) {
      const snippet = item.str.trim().substring(0, 80);
      if (snippet) samples.push(snippet);
    }

    textItems.push({ y, height: rawHeight, text: item.str.trim(), fontName, fontSize });
  }

  // Sort by Y descending (PDF coords: top of page = higher Y)
  textItems.sort((a, b) => b.y - a.y);

  const lineGaps: LineGap[] = [];
  for (let i = 0; i < textItems.length - 1; i++) {
    const curr = textItems[i];
    const next = textItems[i + 1];
    const gap = curr.y - next.y;
    if (gap > 0.5 && gap < 100) {
      lineGaps.push({
        y1: curr.y,
        y2: next.y,
        gap: Math.round(gap * 100) / 100,
        text1: curr.text.substring(0, 50),
        text2: next.text.substring(0, 50),
      });
    }
  }

  // Aggregate gap statistics
  const gapValues = lineGaps.map(g => g.gap);
  const gapFreq = new Map<number, number>();
  for (const g of gapValues) {
    const rounded = Math.round(g * 10) / 10;
    gapFreq.set(rounded, (gapFreq.get(rounded) || 0) + 1);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`PAGE ${pageNum}  (${viewport.width.toFixed(1)} x ${viewport.height.toFixed(1)} pts)`);
  console.log('='.repeat(80));

  console.log('\n--- FONTS ---');
  for (const [name, fi] of fonts) {
    const style = [fi.bold ? 'BOLD' : '', fi.italic ? 'ITALIC' : ''].filter(Boolean).join(', ') || 'regular';
    console.log(`\n  Font: "${name}"  [${style}]`);
    const sortedSizes = [...fi.sizes.entries()].sort((a, b) => b[0] - a[0]);
    for (const [size, samples] of sortedSizes) {
      console.log(`    Size ${size} pt:`);
      for (const s of samples) {
        console.log(`      "${s}"`);
      }
    }
  }

  console.log('\n--- LINE SPACING (top 15 most common gaps) ---');
  const sortedGaps = [...gapFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  for (const [gap, count] of sortedGaps) {
    console.log(`  Gap ${gap.toFixed(1)} pt  (×${count})`);
  }

  if (lineGaps.length > 0) {
    console.log('\n--- SAMPLE LINE PAIRS (first 8) ---');
    for (const lg of lineGaps.slice(0, 8)) {
      console.log(`  [y=${lg.y1.toFixed(1)} → y=${lg.y2.toFixed(1)}]  gap=${lg.gap} pt`);
      console.log(`    L1: "${lg.text1}"`);
      console.log(`    L2: "${lg.text2}"`);
    }
  }

  page.cleanup();
}

async function main() {
  const filename = process.argv[2];
  if (!filename) {
    console.error('Usage: npx tsx scripts/analyze-pdf.ts <pdf-file>');
    process.exit(1);
  }

  const pdfPath = resolve(process.cwd(), filename);
  const pdfUrl = pathToFileURL(pdfPath).href;
  console.log(`Analyzing: ${pdfPath}`);

  const doc = await getDocument({ url: pdfUrl, useSystemFonts: true }).promise;
  const totalPages = doc.numPages;
  console.log(`Total pages: ${totalPages}`);

  const targetPages = new Set<number>();
  for (const p of [1, 2, 9, 10, 11, 12]) {
    if (p <= totalPages) targetPages.add(p);
  }
  // Last 3 pages
  for (let i = Math.max(1, totalPages - 2); i <= totalPages; i++) {
    targetPages.add(i);
  }

  const sorted = [...targetPages].sort((a, b) => a - b);
  console.log(`Analyzing pages: ${sorted.join(', ')}`);

  for (const pageNum of sorted) {
    await analyzePage(doc, pageNum);
  }

  await doc.destroy();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
