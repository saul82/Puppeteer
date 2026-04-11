import { readFileSync } from 'fs';
import { join } from 'path';

let _cachedPages: string[] | null = null;
let _cachedCSS: string | null = null;

function loadTemplate(): string {
  const templatePath = join(process.cwd(), 'spanish_IEP_template_v4.html');
  return readFileSync(templatePath, 'utf-8');
}

/**
 * Extracts the original CSS from the template's <style> block.
 * This ensures we use the exact same CSS the template author wrote.
 */
export function getTemplateCSS(): string {
  if (_cachedCSS) return _cachedCSS;

  const html = loadTemplate();
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (!styleMatch) throw new Error('Could not find <style> in template');

  _cachedCSS = styleMatch[1];
  return _cachedCSS;
}

/**
 * Reads the HTML template file and splits it into individual page chunks.
 * Each chunk is the full <div class="page">...</div> element.
 * Returns the raw page strings (with {{variables}} still in place).
 */
export function getTemplatePages(): string[] {
  if (_cachedPages) return _cachedPages;

  const html = loadTemplate();

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('Could not find <body> in template');
  const body = bodyMatch[1];

  const pages: string[] = [];
  const pageRegex = /<div class="page">([\s\S]*?)(?=<div class="page">|$)/g;
  let match: RegExpExecArray | null;

  while ((match = pageRegex.exec(body)) !== null) {
    let content = match[0];
    const lastDivClose = content.lastIndexOf('</div>');
    if (lastDivClose !== -1) {
      content = content.substring(0, lastDivClose + 6);
    }
    pages.push(content.trim());
  }

  _cachedPages = pages;
  return pages;
}

/**
 * Page indices in the template (0-based) mapped to their logical section.
 * This tells us which template pages to skip when we generate dynamic content.
 */
export const PAGE_ROLES = {
  INFO_ELIGIBILITY: 0,        // Page 1
  PRESENT_LEVELS_SBAC: 1,     // Page 2
  PRESENT_LEVELS_CONT: 2,     // Page 3
  PRESENT_LEVELS_VOC: 3,      // Page 4
  // Pages 4-7 (indices 4,5,6,7) = hardcoded goals g1-g4 — SKIPPED, generated dynamically
  GOAL_START: 4,
  GOAL_END: 7,
  SPECIAL_FACTORS: 8,         // Page 9
  FAPE_SERVICES: 9,           // Page 10
  PLACEMENT_ESY: 10,          // Page 11 (ubicación + ESY)
  SIGNATURES: 11,             // Page 12 — assembled after Manifestation in htmlBuilder
  ITP_1: 12,                  // Page 13
  ITP_2: 13,                  // Page 14
  // Pages 14-17 = prior-year goals in raw template; htmlBuilder emits these via
  // buildGoalPages(data.priorGoals) only when priorGoals has content (otherwise omitted).
  PRIOR_GOAL_START: 14,
  PRIOR_GOAL_END: 17,
  SERVICE_CONTINUATION: 18,   // Page 19
  EMERGENCY_1: 19,            // Page 20
  EMERGENCY_2: 20,            // Page 21
  STATE_ASSESS_1: 21,         // Page 22
  STATE_ASSESS_2: 22,         // Page 23
  BIP: 23,                    // Page 24
  /** Three template pages: pathways, req 2–3 text, req 4 tables (elem + sec) */
  RECLASS_1: 24,
  RECLASS_2: 25,
  RECLASS_3: 26,
  EXCUSED_MEMBER: 27,
  MANIFEST_1: 28,
  MANIFEST_2: 29,
  NOTICE_1A: 30,
  NOTICE_1B: 31,
  NOTICE_2A: 32,
  NOTICE_2B: 33,
  EVAL_PLAN: 34,
  NOTICE_ACTION: 35,
  NOTICE_ACTION_CONT: 36,
} as const;
