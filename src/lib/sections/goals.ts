import type { Goal } from '../types';

function s(val: string | null | undefined): string {
  return val ?? '';
}

/** True if the goal has any user-entered content worth printing on its own page. */
export function goalHasContent(goal: Goal): boolean {
  const texts = [
    goal.goalNumber,
    goal.areaOfNeed,
    goal.baselineLevel,
    goal.annualGoal,
    goal.stateStandard,
    goal.responsiblePerson,
    goal.annualReviewDate,
    goal.annualReviewComments,
    goal.transitionType,
  ];
  if (texts.some(t => t != null && String(t).trim() !== '')) return true;

  for (const sto of goal.shortTermObjectives ?? []) {
    if (sto.objective?.trim() || sto.targetDate?.trim()) return true;
  }
  for (const pr of goal.progressReports ?? []) {
    if (pr.date?.trim() || pr.summary?.trim() || pr.comments?.trim()) return true;
  }

  if (goal.goalMet === true || goal.goalMet === false) return true;
  if (goal.alignsToGeneralCurriculum) return true;
  if (goal.addressesOtherNeeds) return true;
  if (goal.linguisticallyAppropriate) return true;
  if (goal.isTransitionGoal) return true;

  return false;
}

function cb(val: boolean | null | undefined): string {
  return val ? 'on' : '';
}

function cbNot(val: boolean | null | undefined): string {
  return val ? '' : 'on';
}

function hdrRow(studentName: string, dob: string, iepDate: string): string {
  return `
  <div class="hdr-row">
    <div><span class="lbl">Nombre del Estudiante:</span> <span class="val">${studentName}</span></div>
    <div><span class="lbl">Fecha de Nacimiento:</span> <span class="val">${dob}</span></div>
    <div><span class="lbl">Fecha del IEP:</span> <span class="val">${iepDate}</span></div>
  </div>
  <hr>`;
}

function progressReportBlock(goal: Goal): string {
  const reports = goal.progressReports || [];
  let html = '';
  for (let i = 0; i < 3; i++) {
    const pr = reports[i];
    const hasData = pr && pr.date;
    const marginClass = i === 0 ? 'mt4' : 'mt6';
    html += `
  <div class="${marginClass}">
    <p><span class="lbl">Reporte de Progreso ${i + 1}:</span> ${hasData ? s(pr.date) : ''}</p>
    <p><span class="lbl">Resumen del Progreso:</span> ${hasData ? s(pr.summary) : ''}</p>
    <p><span class="lbl">Comentarios:</span> ${hasData ? s(pr.comments) : ''}</p>
  </div>`;
  }
  return html;
}

function shortTermObjectivesBlock(goal: Goal): string {
  if (!goal.shortTermObjectives || goal.shortTermObjectives.length === 0) return '';
  let html = '<div class="mt4">';
  for (const sto of goal.shortTermObjectives) {
    html += `<p class="mt4"><span class="lbl">Objetivo a Corto Plazo:</span> ${s(sto.objective)}</p>`;
  }
  html += '</div>';
  return html;
}

function annualReviewBlock(goal: Goal): string {
  return `
  <div class="mt6">
    <p><span class="lbl">Revisión Anual &nbsp; Fecha:</span> ${s(goal.annualReviewDate)}</p>
    <p>
      <span class="lbl">Meta Alcanzada</span>
      <span class="cb-item"><span class="cb ${cb(goal.goalMet)}"></span><span class="lbl">Sí</span></span>
      <span class="cb-item"><span class="cb ${goal.goalMet === false ? 'on' : ''}"></span><span class="lbl">No</span></span>
    </p>
    <p><span class="lbl">Comentarios:</span> ${s(goal.annualReviewComments)}</p>
  </div>`;
}

function transitionTypeCheck(goal: Goal, type: string): string {
  return goal.transitionType === type ? 'on' : '';
}

export function buildGoalPage(
  goal: Goal,
  studentName: string,
  dob: string,
  iepDate: string,
  formTitle: string
): string {
  const hasSTOs = goal.shortTermObjectives && goal.shortTermObjectives.length > 0;

  return `<div class="page">
  <div class="page-counter">Página _____ de _____</div>
  <div class="page-title">
    <span class="org">MID CITIES SELPA</span>
    <span class="form-name">${formTitle}</span>
  </div>
  ${hdrRow(studentName, dob, iepDate)}

  <table class="goal-tbl" style="margin-top:5pt;">
    <tr>
      <td class="td-base" style="vertical-align:top;">
        <p><span class="lbl">Área Básica de Necesidad:</span> ${s(goal.areaOfNeed)}</p>
        <p style="margin-top:5pt;"><span class="lbl">Niveles actuales de rendimiento/nivel básico:</span> ${s(goal.baselineLevel)}</p>
      </td>
      <td class="td-goal" style="vertical-align:top;">
        <p><span class="lbl">Objetivo Anual Medible #:</span> ${s(goal.goalNumber)}</p>
        <p style="margin-top:5pt;"><span class="lbl">Meta:</span> ${s(goal.annualGoal)}</p>
        <div style="margin-top:7pt;">
          <div><span class="cb-item"><span class="cb ${cb(goal.alignsToGeneralCurriculum)}"></span>Permite al alumno estar envuelto/progresó en el plan general de estudios/estándar del estado &nbsp;${s(goal.stateStandard)}</span></div>
          <div style="margin-top:3pt;"><span class="cb-item"><span class="cb ${cb(goal.addressesOtherNeeds)}"></span>Se dirige a otras necesidades educativas que resultan de la discapacidad</span></div>
          <div style="margin-top:3pt;"><span class="cb-item"><span class="cb ${cb(goal.linguisticallyAppropriate)}"></span>Lingüísticamente apropiada</span></div>
        </div>
        <div style="margin-top:7pt;">
          <span class="cb-item"><span class="cb ${cb(goal.isTransitionGoal)}"></span>Objetivo de Transición:</span>
          <span class="cb-item"><span class="cb ${transitionTypeCheck(goal, 'Educación/Entrenamiento')}"></span>Educación/Entrenamiento</span>
          <span class="cb-item"><span class="cb ${transitionTypeCheck(goal, 'Empleo')}"></span>Empleo</span>
          <span class="cb-item"><span class="cb ${transitionTypeCheck(goal, 'Vida Independiente')}"></span>Vida Independiente</span>
        </div>
        <p style="margin-top:3pt;"><span class="lbl">Persona(s) Responsable:</span> ${s(goal.responsiblePerson)}</p>
      </td>
    </tr>
  </table>

  ${hasSTOs ? shortTermObjectivesBlock(goal) : ''}
  ${progressReportBlock(goal)}
  ${annualReviewBlock(goal)}
</div>`;
}

export function buildGoalPages(
  goals: Goal[],
  studentName: string,
  dob: string,
  iepDate: string,
  formTitle: string = 'METAS ANUALES Y OBJETIVOS'
): string[] {
  return goals
    .filter(goalHasContent)
    .map(goal => buildGoalPage(goal, studentName, dob, iepDate, formTitle));
}
