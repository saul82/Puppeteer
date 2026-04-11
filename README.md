# Spanish IEP PDF Renderer

A Next.js application that transforms JSON IEP (Individualized Education Program) data into pixel-accurate Spanish-language PDF documents using Puppeteer.

## Architecture

```
JSON Payload → POST /api/render-iep → Variable Mapper → HTML Builder → Puppeteer → PDF
```

| Module | File | Purpose |
|---|---|---|
| Types | `src/lib/types.ts` | TypeScript interfaces for the full IEP schema |
| Variable Map | `src/lib/variableMap.ts` | Maps nested JSON → 300+ flat template variables |
| Template Parser | `src/lib/templates/templateParser.ts` | Splits HTML template into per-page chunks at runtime |
| CSS | `src/lib/templates/styles.ts` | Extracted stylesheet (Helvetica, US Letter, 0.75in margins) |
| Goal Generator | `src/lib/sections/goals.ts` | Generates one page per goal with progress reports and STOs |
| Service Generator | `src/lib/sections/services.ts` | Builds accommodation, modification, support, and service blocks |
| HTML Builder | `src/lib/htmlBuilder.ts` | Assembles all pages in order with dynamic page numbering |
| Renderer | `src/lib/renderer.ts` | Puppeteer-based PDF generation (US Letter, `printBackground`) |
| API Route | `src/app/api/render-iep/route.ts` | `POST /api/render-iep` endpoint |
| Test Script | `scripts/test-render.ts` | CLI tool for end-to-end rendering |

## Setup

```bash
npm install
```

## Usage

### CLI — Generate PDFs directly

```bash
# Elementary student (4 goals, 2 services, no ITP)
npm run render:elementary

# Transition student (2 goals, 1 service, full ITP)
npm run render:transition

# Custom input/output
npx tsx scripts/test-render.ts <input.json> <output.pdf>
```

Both PDF and HTML files are written (the HTML is useful for debugging layout).

### API — Start the server

```bash
npm run dev
```

Then POST JSON to the endpoint:

```bash
# Get PDF
curl -X POST http://localhost:3000/api/render-iep \
  -H "Content-Type: application/json" \
  -d @sample_iep_elementary_student.json \
  -o output.pdf

# Get raw HTML (for debugging)
curl -X POST "http://localhost:3000/api/render-iep?debug=html" \
  -H "Content-Type: application/json" \
  -d @sample_iep_elementary_student.json \
  -o output.html
```

### Production build

```bash
npm run build
npm start
```

## Key Design Decisions

- **Hybrid static + dynamic**: Fixed pages (info, assessments, signatures, etc.) use the original HTML template with `{{variable}}` replacement. Variable-length sections (goals, services) are generated programmatically.
- **Template-at-runtime**: The `spanish_IEP_template_v4.html` file is read and split into page chunks at startup — no need to maintain duplicated HTML in TypeScript strings.
- **Conditional ITP**: Transition planning pages are only included when transition data exists in the JSON payload.
- **Zero orphaned placeholders**: Every `{{variable}}` in the template resolves to a value (or empty string). The QC pass confirmed 0 leftover `{{...}}` markers in both test outputs.

## Input JSON Schema

The API expects a JSON body matching the `IEPData` interface defined in `src/lib/types.ts`. See `sample_iep_elementary_student.json` and `sample_iep_transition_student.json` for realistic examples.

Required top-level keys: `meta`, `student`, `parents`, `district`, `eligibility`, `presentLevels`, `goals`, `specialFactors`, `fapeServices`, `placementForm`, `stateAssessments`, `transition`, `emergencyPlan`, `bip`.

## Files

| File | Description |
|---|---|
| `spanish_IEP_template_v4.html` | Source HTML/CSS template (3,022 lines) |
| `REDACTED_spanish seis.pdf` | Reference PDF for QC comparison |
| `sample_iep_elementary_student.json` | Test data — elementary student |
| `sample_iep_transition_student.json` | Test data — transition-age student |
