import { NextRequest, NextResponse } from 'next/server';
import { renderIEP, renderIEPtoHTML } from '@/lib/renderer';
import type { IEPData } from '@/lib/types';

/** Allow enough time for Chromium cold start + PDF on Vercel (adjust per plan). */
export const maxDuration = 60;

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

    const pdfBuffer = await renderIEP(data);

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
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Render error:', message);
    return NextResponse.json(
      { error: `Render failed: ${message}` },
      { status: 500 }
    );
  }
}
