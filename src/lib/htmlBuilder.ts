import type { IEPData } from './types';
import { getTemplatePages, getTemplateCSS, PAGE_ROLES } from './templates/templateParser';
import { buildVariableMap, replaceVariables } from './variableMap';
import { buildGoalPages, goalHasContent } from './sections/goals';
import {
  buildAccommodationRows,
  buildModificationRows,
  buildSupportRows,
  buildFirstServiceBlock,
  buildContinuationServiceBlocks,
} from './sections/services';

function parseName(legalName: string): { last: string; first: string } {
  const parts = legalName.split(',').map(p => p.trim());
  const last = parts[0] || '';
  const first = parts[1] || '';
  return { last, first };
}

function injectPageNumbers(pages: string[]): string[] {
  const total = pages.length;
  return pages.map((page, i) => {
    return page.replace(
      /Página\s+_____\s+de\s+_____/g,
      `Página ${i + 1} de ${total}`
    );
  });
}

export function buildFullHTML(data: IEPData): string {
  const templatePages = getTemplatePages();
  const vars = buildVariableMap(data);

  const name = parseName(data.student.legalName);
  const studentDisplay = `${name.last}, ${name.first}`;
  const dob = data.student.dob;
  const iepDate = data.meta.iepDate;

  // Inject dynamic table rows into the variable map
  vars['accommodationsRows'] = buildAccommodationRows(data.fapeServices.adaptations);
  vars['otherSupportsRows'] = buildSupportRows(data.fapeServices.otherSupports);
  vars['servicesBlock'] = buildFirstServiceBlock(data.fapeServices.specialEdServices);

  // Build service continuation blocks
  const svcContinuation = buildContinuationServiceBlocks(data.fapeServices.specialEdServices);
  vars['svcContinuationComment'] = '';

  // Inject modification rows — the template has a hardcoded empty row
  // We need to replace it with dynamic content on the FAPE page
  const modRows = buildModificationRows(data.fapeServices.modifications);

  // Build dynamic goal pages
  const currentGoalPages = buildGoalPages(
    data.goals, studentDisplay, dob, iepDate, 'METAS ANUALES Y OBJETIVOS'
  );

  // Prior-year goals: only render when `priorGoals` is present and has content.
  const priorGoals = (data.priorGoals ?? []).filter(goalHasContent);

  // Determine if transition pages should be included
  const hasTransition = data.transition.studentInvited ||
    data.transition.transitionGoals.length > 0 ||
    !!data.transition.postsecondaryEducationGoal;

  // Assemble pages in client-specified order:
  // Eligibility → Present Levels → ITP → Annual Goals → Special Factors →
  // FAPE Services → (service continuation) → FAPE Placement → Emergency →
  // State Assessments → BIP → Reclassification → Excused → Manifestation →
  // Signatures → Meeting Notices (×2) → Assessment Plan (+ Notice of Action)
  const assembledPages: string[] = [];

  // 1–2. Eligibility + Present Levels (template indices 0–3)
  for (let i = 0; i <= 3; i++) {
    if (templatePages[i]) {
      assembledPages.push(replaceVariables(templatePages[i], vars));
    }
  }

  // 3. Transition Planning (ITP) — immediately after Present Levels, before goals
  if (hasTransition) {
    if (templatePages[PAGE_ROLES.ITP_1]) {
      assembledPages.push(replaceVariables(templatePages[PAGE_ROLES.ITP_1], vars));
    }
    if (templatePages[PAGE_ROLES.ITP_2]) {
      assembledPages.push(replaceVariables(templatePages[PAGE_ROLES.ITP_2], vars));
    }
  }

  // 4. Annual Goals (dynamic; replaces hardcoded template indices 4–7)
  for (const goalPage of currentGoalPages) {
    assembledPages.push(goalPage);
  }

  // Prior-year goals — dynamic pages only when JSON includes `priorGoals` with content
  if (priorGoals.length > 0) {
    const priorPages = buildGoalPages(
      priorGoals,
      studentDisplay,
      dob,
      iepDate,
      'METAS ANUALES'
    );
    for (const p of priorPages) {
      assembledPages.push(p);
    }
  }

  // 5. Special Factors
  if (templatePages[PAGE_ROLES.SPECIAL_FACTORS]) {
    assembledPages.push(replaceVariables(templatePages[PAGE_ROLES.SPECIAL_FACTORS], vars));
  }

  // 6. FAPE Services — replace the hardcoded modification row
  if (templatePages[PAGE_ROLES.FAPE_SERVICES]) {
    let fapePage = replaceVariables(templatePages[PAGE_ROLES.FAPE_SERVICES], vars);
    fapePage = fapePage.replace(
      /<tr><td class="mod-c1" style="height:16pt;"><\/td><td><\/td><td><\/td><td><\/td><td><\/td><td><\/td><\/tr>/,
      modRows
    );
    assembledPages.push(fapePage);
  }

  // Service continuation (extra FAPE services page) — before Placement
  if (templatePages[PAGE_ROLES.SERVICE_CONTINUATION]) {
    let contPage = replaceVariables(templatePages[PAGE_ROLES.SERVICE_CONTINUATION], vars);
    if (svcContinuation) {
      // Dynamic blocks use variable map / template placeholders
    }
    assembledPages.push(contPage);
  }

  // 7. FAPE Placement / ESY
  if (templatePages[PAGE_ROLES.PLACEMENT_ESY]) {
    assembledPages.push(replaceVariables(templatePages[PAGE_ROLES.PLACEMENT_ESY], vars));
  }

  // 8. Emergency Program
  for (let i = PAGE_ROLES.EMERGENCY_1; i <= PAGE_ROLES.EMERGENCY_2; i++) {
    if (templatePages[i]) {
      assembledPages.push(replaceVariables(templatePages[i], vars));
    }
  }

  // 9. State Assessments
  for (let i = PAGE_ROLES.STATE_ASSESS_1; i <= PAGE_ROLES.STATE_ASSESS_2; i++) {
    if (templatePages[i]) {
      assembledPages.push(replaceVariables(templatePages[i], vars));
    }
  }

  // 10. Behavior Intervention Plan
  if (templatePages[PAGE_ROLES.BIP]) {
    assembledPages.push(replaceVariables(templatePages[PAGE_ROLES.BIP], vars));
  }

  // 11. Reclassification Criteria (3 template pages)
  for (let i = PAGE_ROLES.RECLASS_1; i <= PAGE_ROLES.RECLASS_3; i++) {
    if (templatePages[i]) {
      assembledPages.push(replaceVariables(templatePages[i], vars));
    }
  }

  // 12. Excused Member
  if (templatePages[PAGE_ROLES.EXCUSED_MEMBER]) {
    assembledPages.push(replaceVariables(templatePages[PAGE_ROLES.EXCUSED_MEMBER], vars));
  }

  // 13. Manifestation Determination
  for (let i = PAGE_ROLES.MANIFEST_1; i <= PAGE_ROLES.MANIFEST_2; i++) {
    if (templatePages[i]) {
      assembledPages.push(replaceVariables(templatePages[i], vars));
    }
  }

  // 14. Signature / Consent (moved after Manifestation, before Meeting Notices)
  if (templatePages[PAGE_ROLES.SIGNATURES]) {
    assembledPages.push(replaceVariables(templatePages[PAGE_ROLES.SIGNATURES], vars));
  }

  // 15. Meeting Notice ×2 (four template pages)
  for (let i = PAGE_ROLES.NOTICE_1A; i <= PAGE_ROLES.NOTICE_2B; i++) {
    if (templatePages[i]) {
      assembledPages.push(replaceVariables(templatePages[i], vars));
    }
  }

  // 16. Assessment Plan + Notice of Action continuation
  for (let i = PAGE_ROLES.EVAL_PLAN; i <= PAGE_ROLES.NOTICE_ACTION_CONT; i++) {
    if (templatePages[i]) {
      assembledPages.push(replaceVariables(templatePages[i], vars));
    }
  }

  // Inject page numbers
  const numberedPages = injectPageNumbers(assembledPages);

  const templateCSS = getTemplateCSS();

  // Minimal corrections only — the template CSS sizes (9pt body, 11pt title,
  // 8pt tables) are the authoritative values measured from the reference PDF.
  const corrections = `
/* ── Print corrections ── */
body { background: #fff; }
.cb { flex-shrink: 0; }
.assess-table .cb-item { font-size: 7.5pt; line-height: 1.25; }
.notice-rsvp .cb-item { font-size: 8.5pt; line-height: 1.3; }
`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>IEP - ${studentDisplay} - Mid Cities SELPA</title>
<style>
${templateCSS}
${corrections}
</style>
</head>
<body>
${numberedPages.join('\n\n')}
</body>
</html>`;
}
