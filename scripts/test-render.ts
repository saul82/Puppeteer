import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { buildFullHTML } from '../src/lib/htmlBuilder';
import { launchBrowser } from '../src/lib/puppeteerLaunch';
import type { IEPData } from '../src/lib/types';

async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || 'sample_iep_elementary_student.json';
  const outputFile = args[1] || 'output.pdf';

  const inputPath = resolve(process.cwd(), inputFile);
  const outputPath = resolve(process.cwd(), outputFile);

  console.log(`Reading JSON: ${inputPath}`);
  const jsonStr = readFileSync(inputPath, 'utf-8');
  const data: IEPData = JSON.parse(jsonStr);

  console.log(`Student: ${data.student.legalName}`);
  console.log(`Goals: ${data.goals.length}`);
  console.log(`Services: ${data.fapeServices.specialEdServices.length}`);

  console.log('Building HTML...');
  const html = buildFullHTML(data);

  // Also write the HTML for debugging
  const htmlPath = outputPath.replace(/\.pdf$/, '.html');
  writeFileSync(htmlPath, html, 'utf-8');
  console.log(`HTML written to: ${htmlPath}`);

  console.log('Launching Puppeteer...');
  const browser = await launchBrowser();

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  console.log('Generating PDF...');
  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: false,
  });

  writeFileSync(outputPath, pdf);
  console.log(`PDF written to: ${outputPath} (${pdf.length} bytes)`);

  // Count pages in generated HTML
  const pageCount = (html.match(/<div class="page">/g) || []).length;
  console.log(`Total pages: ${pageCount}`);

  await browser.close();
  console.log('Done.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
