import puppeteer from 'puppeteer-core';
import type { Browser } from 'puppeteer-core';

/** Extra flags shared with local Chrome/Chromium. */
const EXTRA_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--font-render-hinting=none',
];

function isServerless(): boolean {
  return (
    process.env.VERCEL === '1' ||
    !!process.env.VERCEL_ENV ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

/**
 * Launches a browser for PDF rendering.
 * - On Vercel / Lambda: puppeteer-core + @sparticuz/chromium (small serverless binary).
 * - Locally: CHROME_EXECUTABLE_PATH / PUPPETEER_EXECUTABLE_PATH, or devDependency `puppeteer`’s bundled Chromium.
 */
export async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const execPath = await chromium.executablePath();
    return puppeteer.launch({
      args: [...chromium.args, '--font-render-hinting=none'],
      executablePath: execPath,
      headless: true,
    });
  }

  let executablePath =
    process.env.CHROME_EXECUTABLE_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;

  if (!executablePath) {
    try {
      const puppeteerFull = await import('puppeteer');
      executablePath = puppeteerFull.default.executablePath();
    } catch {
      throw new Error(
        'Local PDF render: set CHROME_EXECUTABLE_PATH to Chrome/Chromium, or run `npm install` so devDependency `puppeteer` supplies bundled Chromium.'
      );
    }
  }

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: EXTRA_ARGS,
  });
}
