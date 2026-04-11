import type { Adaptation, Modification, OtherSupport, SpecialEdService } from '../types';

function s(val: string | null | undefined): string {
  return val ?? '';
}

function cb(val: boolean | null | undefined): string {
  return val ? 'on' : '';
}

export function buildAccommodationRows(adaptations: Adaptation[]): string {
  if (adaptations.length === 0) {
    return '<tr><td class="acc-c1" style="height:16pt;"></td><td></td><td></td><td></td></tr>';
  }
  return adaptations.map(a => `
    <tr>
      <td class="acc-c1">${s(a.description)}</td>
      <td class="acc-c2">${s(a.startDate)}</td>
      <td class="acc-c3">${s(a.endDate)}</td>
      <td class="acc-c4">${s(a.location)}</td>
    </tr>`).join('');
}

export function buildModificationRows(modifications: Modification[]): string {
  if (modifications.length === 0) {
    return '<tr><td class="mod-c1" style="height:16pt;"></td><td></td><td></td><td></td><td></td><td></td></tr>';
  }
  return modifications.map(m => `
    <tr>
      <td class="mod-c1">${s(m.description)}</td>
      <td class="mod-c2">${s(m.startDate)}</td>
      <td class="mod-c3">${s(m.endDate)}</td>
      <td class="mod-c4">${s(m.frequency)}</td>
      <td class="mod-c5">${s(m.duration)}</td>
      <td class="mod-c6">${s(m.location)}</td>
    </tr>`).join('');
}

export function buildSupportRows(supports: OtherSupport[]): string {
  if (supports.length === 0) {
    return '<tr><td class="sup-c1" style="height:16pt;"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
  }
  return supports.map(sup => `
    <tr>
      <td class="sup-c1">${s(sup.description)}</td>
      <td class="sup-c2">${s(sup.supports)}</td>
      <td class="sup-c3">${s(sup.startDate)}</td>
      <td class="sup-c4">${s(sup.endDate)}</td>
      <td class="sup-c5">${s(sup.frequency)}</td>
      <td class="sup-c6">${s(sup.duration)}</td>
      <td class="sup-c7">${s(sup.location)}</td>
    </tr>`).join('');
}

function buildSingleServiceBlock(svc: SpecialEdService): string {
  const durationFreq = `${svc.minutesPerSession} min × ${svc.sessionsPerWeek}/sem = ${svc.totalMinutesPerWeek} min/sem (${svc.frequency})`;

  return `
  <table style="border-collapse:collapse; width:100%; margin-top:6pt;">
    <tr>
      <td style="border:0.75pt solid #000; padding:3pt; font-size:8pt; width:44%;"><span class="lbl">Servicio:</span> ${s(svc.service)}</td>
      <td style="border:0.75pt solid #000; padding:3pt; font-size:8pt; width:28%;"><span class="lbl">Fecha de Inicio:</span> ${s(svc.startDate)}</td>
      <td style="border:0.75pt solid #000; padding:3pt; font-size:8pt; width:28%;"><span class="lbl">Fecha de Terminación:</span> ${s(svc.endDate)}</td>
    </tr>
    <tr>
      <td style="border:0.75pt solid #000; padding:3pt; font-size:8pt;"><span class="lbl">Proveedor:</span> ${s(svc.provider)}</td>
      <td colspan="2" style="border:0.75pt solid #000; padding:3pt; font-size:8pt;">
        <span class="cb-item"><span class="cb ${svc.deliveryModel === 'Individual' ? 'on' : ''}"></span>Ind</span>
        <span class="cb-item"><span class="cb ${svc.deliveryModel === 'Group' ? 'on' : ''}"></span>Grupo</span>
        <span class="cb-item"><span class="cb ${cb(svc.isSecTransition)}"></span>Sec Transición</span>
      </td>
    </tr>
    <tr>
      <td style="border:0.75pt solid #000; padding:3pt; font-size:8pt;"><span class="lbl">Duración/Frecuencia:</span> ${durationFreq}</td>
      <td colspan="2" style="border:0.75pt solid #000; padding:3pt; font-size:8pt;"><span class="lbl">Localidad:</span> ${s(svc.location)}</td>
    </tr>
    <tr>
      <td colspan="3" style="border:0.75pt solid #000; padding:3pt; font-size:8pt;"><span class="lbl">Comentarios:</span> ${s(svc.comments)}</td>
    </tr>
  </table>`;
}

/**
 * Builds the services block that goes on the FAPE services page.
 * Returns the first service block HTML for injection into {{servicesBlock}}.
 */
export function buildFirstServiceBlock(services: SpecialEdService[]): string {
  if (services.length === 0) return '';
  return buildSingleServiceBlock(services[0]);
}

/**
 * Builds continuation service blocks (services beyond the first).
 * These go on the service continuation page.
 */
export function buildContinuationServiceBlocks(services: SpecialEdService[]): string {
  if (services.length <= 1) return '';
  return services.slice(1).map(svc => buildSingleServiceBlock(svc)).join('');
}
