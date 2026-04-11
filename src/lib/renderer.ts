import type { IEPData } from './types';
import { buildFullHTML } from './htmlBuilder';
import { launchBrowser } from './puppeteerLaunch';

/**
 * Renders IEP JSON to PDF. Launches and closes a browser per call so serverless
 * (Vercel) does not leak processes or rely on a warm singleton.
 */
export async function renderIEP(data: IEPData): Promise<Buffer> {
  const html = buildFullHTML(data);
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        preferCSSPageSize: false,
      });

      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

export function renderIEPtoHTML(data: IEPData): string {
  return buildFullHTML(data);
}

/** @deprecated Browser is closed after each render; kept for API compatibility. */
export async function closeBrowser(): Promise<void> {
  /* no-op */
}
