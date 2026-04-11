import { readFileSync } from 'fs';
import { resolve } from 'path';
import puppeteer from 'puppeteer';

const PAGE_HEIGHT_96DPI = 1056; // 11in × 96dpi

async function main() {
  const htmlFile = process.argv[2] || 'output_elementary.html';
  const htmlPath = resolve(process.cwd(), htmlFile);

  console.log(`Loading: ${htmlPath}`);
  const html = readFileSync(htmlPath, 'utf-8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const results = await page.evaluate(() => {
    const pages = document.querySelectorAll<HTMLDivElement>('div.page');
    return Array.from(pages).map((el, i) => {
      const rect = el.getBoundingClientRect();
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      const firstHeading =
        el.querySelector('.page-title .form-name')?.textContent?.trim() ||
        el.querySelector('.section-hdr')?.textContent?.trim() ||
        el.querySelector('h2, h3, .lbl')?.textContent?.trim() ||
        '';
      return {
        index: i + 1,
        scrollHeight: el.scrollHeight,
        offsetHeight: el.offsetHeight,
        boundingHeight: Math.round(rect.height),
        firstHeading,
        textSnippet: text.slice(0, 120),
      };
    });
  });

  console.log(`\nLogical pages: ${results.length}`);
  console.log(`Expected max height: ${PAGE_HEIGHT_96DPI}px (11in @ 96dpi)\n`);
  console.log('─'.repeat(90));

  let overflowCount = 0;

  for (const r of results) {
    const overflow = r.scrollHeight > PAGE_HEIGHT_96DPI;
    const delta = r.scrollHeight - PAGE_HEIGHT_96DPI;
    const marker = overflow ? '>>> OVERFLOW' : '    ok';
    if (overflow) overflowCount++;

    console.log(
      `Page ${String(r.index).padStart(2)}: ` +
      `scrollH=${String(r.scrollHeight).padStart(5)}px  ` +
      `offsetH=${String(r.offsetHeight).padStart(5)}px  ` +
      `boundH=${String(r.boundingHeight).padStart(5)}px  ` +
      `delta=${delta > 0 ? '+' : ''}${String(delta).padStart(4)}px  ` +
      `${marker}`
    );
    if (overflow) {
      console.log(`         Section: ${r.firstHeading}`);
      console.log(`         Preview: ${r.textSnippet}`);
    }
  }

  console.log('─'.repeat(90));
  console.log(`\nSummary: ${overflowCount} of ${results.length} pages overflow.`);

  if (overflowCount > 0) {
    console.log('\nOverflowing pages detail:');
    for (const r of results) {
      if (r.scrollHeight > PAGE_HEIGHT_96DPI) {
        const excess = r.scrollHeight - PAGE_HEIGHT_96DPI;
        const excessIn = (excess / 96).toFixed(2);
        console.log(`  Page ${r.index}: ${excess}px (${excessIn}in) over limit — "${r.firstHeading}"`);
      }
    }
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
