import { NextRequest, NextResponse } from 'next/server';
import { renderIEP, renderIEPtoHTML } from '@/lib/renderer';
import type { IEPData } from '@/lib/types';

/** Allow enough time for Chromium cold start + PDF on Vercel (adjust per plan). */
export const maxDuration = 60;

/** Must stay below `maxDuration` so we can return JSON before the platform kills the function. */
const RENDER_DEADLINE_MS = 58_000;

class RenderTimeoutError extends Error {
  constructor() {
    super('PDF generation exceeded the time limit.');
    this.name = 'RenderTimeoutError';
  }
}

async function withRenderDeadline<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new RenderTimeoutError()), ms);
  });
  try {
    return await Promise.race([promise, deadline]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

const REQUIRED_KEYS: (keyof IEPData)[] = [
  'meta', 'student', 'parents', 'district', 'eligibility',
  'presentLevels', 'goals', 'specialFactors', 'fapeServices',
  'placementForm', 'stateAssessments', 'transition', 'emergencyPlan', 'bip',
];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as IEPData;

    const missing = REQUIRED_KEYS.filter(key => !(key in data));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const debug = request.nextUrl.searchParams.get('debug');
    if (debug === 'html') {
      const html = renderIEPtoHTML(data);
      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const pdfBuffer = await withRenderDeadline(renderIEP(data), RENDER_DEADLINE_MS);

    const studentName = data.student.legalName.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ, ]/g, '');
    const filename = `IEP_${studentName}_${data.meta.iepDate}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (err) {
    if (err instanceof RenderTimeoutError) {
      console.error('Render timeout (deadline exceeded)');
      return NextResponse.json(
        {
          error:
            'PDF generation took too long. The document may be very large; try again later or reduce content.',
          code: 'RENDER_TIMEOUT',
        },
        { status: 504 }
      );
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Render error:', message);
    return NextResponse.json(
      { error: `Render failed: ${message}` },
      { status: 500 }
    );
  }
}
