import {
  CRATE_NOTES,
  HS_CODES,
  MATERIAL_TESTS,
  MOQ,
  PACKING,
  SILL_SIZES,
  THRESHOLD_SIZES,
  m2,
  type CrateRow,
} from "@/data/thresholds-and-sills";

/**
 * The collection's technical specifications: every size from the crate
 * sheet with its thickness, pieces per crate and the crate's approximate
 * weight and area, the sheet's notes, and packing, MOQ and HS codes.
 *
 * Too much for the page itself (owner, 2026-10-05), so it opens from a
 * button (TechSpecsDialog) and is printed as the downloadable spec sheet
 * (app/spec-sheets/window-sills-thresholds). No hooks: it renders in both.
 */

export const SPEC_SHEET_PDF = "/downloads/pacific-window-sill-threshold-technical-specifications.pdf";

export function TechnicalSpecs({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-10">
      <div className={compact ? "space-y-10" : "grid gap-10 xl:grid-cols-2"}>
        <CrateTable title="Window sills" rows={SILL_SIZES} />
        <CrateTable title="Thresholds" rows={THRESHOLD_SIZES} />
      </div>
      <ul className="grid gap-1.5 text-sm font-light opacity-80 sm:grid-cols-2">
        {CRATE_NOTES.map((n) => (
          <li key={n} className="flex gap-2">
            <span aria-hidden="true">—</span>
            {n}
          </li>
        ))}
      </ul>
      <dl className="grid gap-x-10 border-t border-[#14140f]/15 sm:grid-cols-3">
        <SpecFact label="Packing">{PACKING}</SpecFact>
        <SpecFact label="Minimum order">{MOQ}</SpecFact>
        <SpecFact label="HS codes">
          {HS_CODES.map((h) => (
            <span key={h.code} className="block">
              {h.material}: <span className="tabular-nums">{h.code}</span>
            </span>
          ))}
        </SpecFact>
      </dl>
    </div>
  );
}

/** The material test results, quartz and Warangal Black granite, laid out
 *  as the owner's tables: numbered tests in lettered groups, each with its
 *  result and method. */
export function MaterialTests({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-8" : "grid gap-10 xl:grid-cols-2"}>
      {MATERIAL_TESTS.map((m) => {
        let n = 0;
        return (
          <div key={m.title}>
            <h3 className="text-sm uppercase tracking-[0.12em]">{m.title}</h3>
            <p className="mt-1 text-sm font-light opacity-70">{m.scope}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <caption className="sr-only">{m.title}: test parameters, results and test methods</caption>
                <thead>
                  <tr className="border-b border-[#14140f]/25 text-[10px] uppercase tracking-[0.1em] opacity-70">
                    <th scope="col" className="w-10 py-2.5 pr-3 font-normal">
                      No.
                    </th>
                    <th scope="col" className="py-2.5 pr-3 font-normal">
                      Test parameter
                    </th>
                    <th scope="col" className="py-2.5 pr-3 font-normal">
                      Result
                    </th>
                    <th scope="col" className="py-2.5 font-normal">
                      Test method
                    </th>
                  </tr>
                </thead>
                {m.groups.map((g, gi) => (
                  <tbody key={g.title}>
                    <tr className="border-b border-[#14140f]/10 bg-[#F4F4F2]">
                      <th scope="rowgroup" colSpan={4} className="px-2 py-2 text-[11px] font-normal uppercase tracking-[0.12em]">
                        {String.fromCharCode(65 + gi)} · {g.title}
                      </th>
                    </tr>
                    {g.tests.map((t) => {
                      n += 1;
                      return (
                        <tr key={t.parameter} className="border-b border-[#14140f]/10">
                          <td className="py-2 pr-3 font-light tabular-nums">{n}</td>
                          <th scope="row" className="py-2 pr-3 font-light">
                            {t.parameter}
                          </th>
                          <td className="whitespace-nowrap py-2 pr-3 tabular-nums">{t.result}</td>
                          <td className="whitespace-nowrap py-2 font-light">{t.method}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                ))}
              </table>
            </div>
            {m.note && <p className="mt-3 text-xs font-light italic leading-relaxed opacity-70">{m.note}</p>}
          </div>
        );
      })}
    </div>
  );
}

function SpecFact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#14140f]/15 py-4">
      <dt className="text-[11px] uppercase tracking-[0.15em] opacity-60">{label}</dt>
      <dd className="mt-1.5 text-sm font-light leading-relaxed">{children}</dd>
    </div>
  );
}

export function CrateTable({ title, rows }: { title: string; rows: CrateRow[] }) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.12em]">{title}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm tabular-nums">
          <thead>
            <tr className="border-b border-[#14140f]/25 text-[10px] uppercase tracking-[0.1em] opacity-70">
              <th scope="col" className="py-2.5 pr-3 font-normal">Length (cm)</th>
              <th scope="col" className="py-2.5 pr-3 font-normal">Width (cm)</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-normal">Thickness (cm)</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-normal">Pieces per crate</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-normal">Weight per crate (kg, approx.)</th>
              <th scope="col" className="py-2.5 text-right font-normal">Area per crate (m², approx.)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.length}x${r.width}`} className="border-b border-[#14140f]/10">
                <th scope="row" className="py-2 pr-3 font-light">
                  {r.length}
                </th>
                <td className="py-2 pr-3 font-light">{r.width}</td>
                <td className="py-2 pr-3 text-right font-light">{r.thickness}</td>
                <td className="py-2 pr-3 text-right font-light">{r.pieces}</td>
                <td className="py-2 pr-3 text-right font-light">{r.kg.toLocaleString("en-GB")}</td>
                <td className="py-2 text-right font-light">{m2(r.m2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
