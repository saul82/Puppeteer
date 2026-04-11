export const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 9pt;
  color: #000;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  width: 8.5in;
  min-height: 11in;
  background: #fff;
  padding: 0.3in 0.75in 0.75in 0.75in;
  position: relative;
  page-break-after: always;
}

.page-counter {
  position: absolute;
  top: 0.12in;
  right: 0.5in;
  font-size: 8pt;
  font-family: Helvetica, Arial, sans-serif;
}

.page-title {
  text-align: center;
  margin-bottom: 5pt;
  padding-top: 4pt;
}
.page-title .org {
  font-size: 11pt;
  font-weight: bold;
  display: block;
  line-height: 1.3;
}
.page-title .form-name {
  font-size: 11pt;
  font-weight: bold;
  display: block;
  line-height: 1.3;
}

hr { border: none; border-top: 0.75pt solid #000; margin: 5pt 0; }
hr.thick { border-top: 1.5pt solid #000; }

.field-line {
  font-size: 9pt;
  line-height: 1.45;
  margin: 0;
  display: block;
}
.lbl { font-weight: bold; }
.val { font-weight: normal; }

.field-row {
  display: flex;
  align-items: baseline;
  flex-wrap: nowrap;
  font-size: 9pt;
  line-height: 1.45;
  gap: 0;
}
.field-row .pair {
  display: inline-flex;
  align-items: baseline;
  flex-shrink: 0;
  margin-right: 14pt;
}
.field-row .pair:last-child { margin-right: 0; }
.field-row .pair .lbl { margin-right: 1pt; }
.field-row .pair-flex {
  display: inline-flex;
  align-items: baseline;
  flex: 1;
  margin-right: 14pt;
}

.two-col {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 0;
  margin: 0;
}

.hdr-row {
  display: grid;
  grid-template-columns: 42% 29% 29%;
  align-items: baseline;
  font-size: 9pt;
  line-height: 1.45;
}

.cb {
  display: inline-block;
  width: 9pt;
  height: 9pt;
  border: 0.75pt solid #000;
  position: relative;
  vertical-align: middle;
  margin-right: 2pt;
  flex-shrink: 0;
}
.cb.on::after {
  content: '\\2713';
  position: absolute;
  top: -3pt;
  left: 0pt;
  font-size: 10pt;
  line-height: 1;
  font-weight: bold;
}
.cb-item {
  display: inline-flex;
  align-items: center;
  margin-right: 12pt;
  font-size: 9pt;
  white-space: nowrap;
  vertical-align: middle;
}
.cb-item:last-child { margin-right: 0; }

p { font-size: 9pt; line-height: 1.4; margin: 0; }
.body-bold { font-weight: bold; font-size: 9pt; }
.body-italic { font-style: italic; font-size: 9pt; }

.section-lbl {
  font-weight: bold;
  font-size: 9pt;
  display: block;
  margin-top: 6pt;
  margin-bottom: 1pt;
}

.sub-heading {
  font-weight: bold;
  font-size: 9.5pt;
  display: block;
  margin: 5pt 0 2pt 0;
}

.div-heading {
  font-weight: bold;
  font-size: 9pt;
  text-align: center;
  border-top: 0.75pt solid #000;
  border-bottom: 0.75pt solid #000;
  padding: 2pt 0;
  margin: 6pt 0 4pt 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
  font-family: Helvetica, Arial, sans-serif;
  margin: 3pt 0;
}
th, td {
  border: 0.75pt solid #000;
  padding: 2.5pt 3pt;
  vertical-align: top;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 8pt;
}
th { font-weight: bold; }

.goal-tbl .td-base { width: 30%; }
.goal-tbl .td-goal { width: 70%; }

.acc-c1 { width: 38%; }
.acc-c2 { width: 18.5%; }
.acc-c3 { width: 18.5%; }
.acc-c4 { width: 25%; }

.mod-c1 { width: 29%; }
.mod-c2, .mod-c3, .mod-c4, .mod-c5 { width: 13.6%; }
.mod-c6 { width: 16.8%; }

.sup-c1 { width: 29%; }
.sup-c2 { width: 15.5%; }
.sup-c3, .sup-c4, .sup-c5, .sup-c6 { width: 10.6%; }
.sup-c7 { width: 13.1%; }

.svc-c1 { width: 44%; }
.svc-c2 { width: 28%; }
.svc-c3 { width: 28%; }

.sig-line {
  display: inline-block;
  border-bottom: 0.5pt solid #000;
  vertical-align: bottom;
}
.sig-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 4pt; }
.sig-table td { border: none; padding: 0 6pt 4pt 0; vertical-align: bottom; font-size: 9pt; font-family: Helvetica, Arial, sans-serif; }
.sig-td-name { width: 36%; }
.sig-td-date { width: 14%; }
.sig-ul { border-bottom: 0.5pt solid #000; height: 16pt; margin-bottom: 2pt; }

.indent { padding-left: 12pt; }
.indent2 { padding-left: 24pt; }

.mt2 { margin-top: 2pt; }
.mt4 { margin-top: 4pt; }
.mt6 { margin-top: 6pt; }
.mt8 { margin-top: 8pt; }
.mb2 { margin-bottom: 2pt; }
.mb4 { margin-bottom: 4pt; }

@media print {
  body { background: white; }
  .page { margin: 0; box-shadow: none; page-break-after: always; }
}
`;
