import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, FlaskConical, Zap, Activity, Copy, Check } from "lucide-react";
import {
  descriptiveStats, oneSampleZTest, twoSampleZTest, oneSampleTTest,
  twoSampleTTest, pairedTTest, oneWayANOVA, chiSquareTest, computePower,
  normalCDF, normalInv, type TestResult, type ANOVAResult, type ChiSquareResult, type PowerResult
} from "@/lib/statistics";
import { fmt, ResultBadge, StepList, NormalCurve, parseNums } from "./StatisticsHelpers";

type Tab = "descriptive" | "hypothesis" | "power" | "distribution";
type HypTest = "z1" | "z2" | "t1" | "t2" | "paired" | "anova" | "chi2";
type Tail = "two" | "left" | "right";

const PRESETS: Record<string, number[]> = {
  "Exam Scores": [72, 85, 90, 67, 78, 92, 88, 76, 81, 95, 70, 83, 87, 79, 91],
  "Reaction Times": [245, 312, 278, 301, 267, 289, 334, 256, 298, 271, 315, 283, 262, 304, 291],
  "Heights (cm)": [165, 172, 158, 180, 169, 175, 162, 178, 171, 166, 173, 168, 181, 160, 177],
};

export function StatisticsSuite() {
  const [tab, setTab] = useState<Tab>("descriptive");
  const [copied, setCopied] = useState(false);
  const [descInput, setDescInput] = useState("72, 85, 90, 67, 78, 92, 88, 76, 81, 95");
  const descData = useMemo(() => parseNums(descInput), [descInput]);
  const descStats = useMemo(() => descData.length >= 2 ? descriptiveStats(descData) : null, [descData]);

  const [hypTest, setHypTest] = useState<HypTest>("t1");
  const [hypAlpha, setHypAlpha] = useState(0.05);
  const [hypTail, setHypTail] = useState<Tail>("two");
  const [hypInput1, setHypInput1] = useState("72, 85, 90, 67, 78, 92, 88, 76, 81, 95");
  const [hypInput2, setHypInput2] = useState("80, 74, 88, 91, 69, 77, 83, 90, 72, 86");
  const [hypMu0, setHypMu0] = useState(80);
  const [hypSigma, setHypSigma] = useState(10);
  const [hypGroups, setHypGroups] = useState("72,85,90,67,78|80,74,88,91,69|91,83,77,95,82");
  const [hypObserved, setHypObserved] = useState("50, 30, 20");
  const [hypExpected, setHypExpected] = useState("33.3, 33.3, 33.3");

  const hypResult = useMemo<TestResult | ANOVAResult | ChiSquareResult | null>(() => {
    const d1 = parseNums(hypInput1), d2 = parseNums(hypInput2);
    if (hypTest === "z1" && d1.length >= 2) return oneSampleZTest(d1, hypMu0, hypSigma, hypAlpha, hypTail);
    if (hypTest === "z2" && d1.length >= 2 && d2.length >= 2) {
      const m1 = d1.reduce((a, b) => a + b, 0) / d1.length, m2 = d2.reduce((a, b) => a + b, 0) / d2.length;
      const s1 = Math.sqrt(d1.reduce((a, v) => a + (v - m1) ** 2, 0) / (d1.length - 1));
      const s2 = Math.sqrt(d2.reduce((a, v) => a + (v - m2) ** 2, 0) / (d2.length - 1));
      return twoSampleZTest(m1, s1, d1.length, m2, s2, d2.length, 0, hypAlpha, hypTail);
    }
    if (hypTest === "t1" && d1.length >= 2) return oneSampleTTest(d1, hypMu0, hypAlpha, hypTail);
    if (hypTest === "t2" && d1.length >= 2 && d2.length >= 2) return twoSampleTTest(d1, d2, hypAlpha, hypTail, true);
    if (hypTest === "paired" && d1.length >= 2 && d2.length >= 2 && d1.length === d2.length) return pairedTTest(d1, d2, hypAlpha, hypTail);
    if (hypTest === "anova") {
      const groups = hypGroups.split("|").map(g => parseNums(g)).filter(g => g.length >= 2);
      if (groups.length >= 2) return oneWayANOVA(groups, hypAlpha);
    }
    if (hypTest === "chi2") {
      const obs = parseNums(hypObserved), exp = parseNums(hypExpected);
      if (obs.length >= 2 && obs.length === exp.length) return chiSquareTest(obs, exp, hypAlpha);
    }
    return null;
  }, [hypTest, hypInput1, hypInput2, hypMu0, hypSigma, hypAlpha, hypTail, hypGroups, hypObserved, hypExpected]);

  const [pwAlpha, setPwAlpha] = useState(0.05);
  const [pwN, setPwN] = useState(30);
  const [pwEffect, setPwEffect] = useState(0.5);
  const [pwTail, setPwTail] = useState<"two" | "one">("two");
  const pwResult = useMemo<PowerResult | null>(() => pwN > 0 && pwEffect > 0 ? computePower(pwAlpha, pwN, pwEffect, pwTail) : null, [pwAlpha, pwN, pwEffect, pwTail]);

  const copyReport = useCallback(() => {
    let text = "";
    if (tab === "descriptive" && descStats) text = `Mean:${fmt(descStats.mean)} Median:${fmt(descStats.median)} SD:${fmt(descStats.stdDev)} Var:${fmt(descStats.variance)} Skew:${fmt(descStats.skewness)}`;
    else if (tab === "hypothesis" && hypResult) text = (hypResult as TestResult).interpretation || (hypResult as ANOVAResult).interpretation || "";
    else if (tab === "power" && pwResult) text = `Power:${fmt(pwResult.power * 100, 1)}% Beta:${fmt(pwResult.beta * 100, 1)}%`;
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }, [tab, descStats, hypResult, pwResult]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "descriptive", label: "Descriptive", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "hypothesis", label: "Tests", icon: <FlaskConical className="h-4 w-4" /> },
    { id: "power", label: "Power", icon: <Zap className="h-4 w-4" /> },
    { id: "distribution", label: "Curve", icon: <Activity className="h-4 w-4" /> },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Statistics Suite</h2>
        <button onClick={copyReport} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1 mb-5 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}>{t.icon}{t.label}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

          {tab === "descriptive" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESETS).map(([name, data]) => (
                  <button key={name} onClick={() => setDescInput(data.join(", "))} className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">{name}</button>
                ))}
              </div>
              <textarea value={descInput} onChange={e => setDescInput(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
              {descStats && (<>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[{ l: "Mean", v: fmt(descStats.mean) }, { l: "Median", v: fmt(descStats.median) }, { l: "Std Dev", v: fmt(descStats.stdDev) }, { l: "Variance", v: fmt(descStats.variance) }, { l: "IQR", v: fmt(descStats.iqr) }, { l: "Skewness", v: fmt(descStats.skewness) }, { l: "Kurtosis", v: fmt(descStats.kurtosis) }, { l: "SEM", v: fmt(descStats.sem) }].map(k => (
                    <div key={k.l} className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.l}</div>
                      <div className="mt-1 text-sm font-bold font-mono text-foreground">{k.v}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div>n: <strong className="text-foreground">{descStats.n}</strong></div>
                  <div>Sum: <strong className="text-foreground">{fmt(descStats.sum, 2)}</strong></div>
                  <div>Range: <strong className="text-foreground">{fmt(descStats.range, 2)}</strong></div>
                  <div>Mode: <strong className="text-foreground">{descStats.mode.length ? descStats.mode.join(", ") : "None"}</strong></div>
                  <div>Trimmed: <strong className="text-foreground">{fmt(descStats.trimmedMean)}</strong></div>
                  <div>Geo Mean: <strong className="text-foreground">{fmt(descStats.geometricMean)}</strong></div>
                  <div>Harm Mean: <strong className="text-foreground">{fmt(descStats.harmonicMean)}</strong></div>
                  <div>Q1/Q3: <strong className="text-foreground">{fmt(descStats.q1, 2)} / {fmt(descStats.q3, 2)}</strong></div>
                </div>
              </>)}
            </div>
          )}

          {tab === "hypothesis" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {([["z1", "1-Z"], ["z2", "2-Z"], ["t1", "1-T"], ["t2", "Welch T"], ["paired", "Paired"], ["anova", "ANOVA"], ["chi2", "χ²"]] as [HypTest, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setHypTest(id)} className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${hypTest === id ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>{label}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="text-xs space-y-1"><span className="text-muted-foreground">α</span>
                  <select value={hypAlpha} onChange={e => setHypAlpha(Number(e.target.value))} className="w-full rounded border border-border bg-background px-2 py-1 text-sm">{[0.01, 0.05, 0.10].map(a => <option key={a} value={a}>{a}</option>)}</select>
                </label>
                <label className="text-xs space-y-1"><span className="text-muted-foreground">Tail</span>
                  <select value={hypTail} onChange={e => setHypTail(e.target.value as Tail)} className="w-full rounded border border-border bg-background px-2 py-1 text-sm"><option value="two">≠</option><option value="right">{">"}</option><option value="left">{"<"}</option></select>
                </label>
                {(hypTest === "z1" || hypTest === "t1") && <label className="text-xs space-y-1"><span className="text-muted-foreground">μ₀</span><input type="number" value={hypMu0} onChange={e => setHypMu0(Number(e.target.value))} className="w-full rounded border border-border bg-background px-2 py-1 text-sm" /></label>}
                {hypTest === "z1" && <label className="text-xs space-y-1"><span className="text-muted-foreground">σ</span><input type="number" value={hypSigma} onChange={e => setHypSigma(Number(e.target.value))} className="w-full rounded border border-border bg-background px-2 py-1 text-sm" /></label>}
              </div>
              {(hypTest !== "anova" && hypTest !== "chi2") && (
                <div className="space-y-2">
                  <textarea value={hypInput1} onChange={e => setHypInput1(e.target.value)} rows={2} className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono" placeholder="Sample 1..." />
                  {(hypTest === "z2" || hypTest === "t2" || hypTest === "paired") && <textarea value={hypInput2} onChange={e => setHypInput2(e.target.value)} rows={2} className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono" placeholder="Sample 2..." />}
                </div>
              )}
              {hypTest === "anova" && <textarea value={hypGroups} onChange={e => setHypGroups(e.target.value)} rows={2} className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono" placeholder="G1|G2|G3" />}
              {hypTest === "chi2" && <div className="space-y-2"><input value={hypObserved} onChange={e => setHypObserved(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono" placeholder="Observed: 50,30,20" /><input value={hypExpected} onChange={e => setHypExpected(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono" placeholder="Expected: 33.3,33.3,33.3" /></div>}
              {hypResult && (
                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{hypTest === "anova" ? `F(${(hypResult as ANOVAResult).dfBetween},${(hypResult as ANOVAResult).dfWithin})=${fmt((hypResult as ANOVAResult).fStat)}` : hypTest === "chi2" ? `χ²=${fmt((hypResult as ChiSquareResult).stat)}` : `Stat=${fmt((hypResult as TestResult).statistic)}`}</div>
                    <ResultBadge reject={hypResult.reject} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs"><div>p: <strong>{fmt(hypResult.pValue, 6)}</strong></div>{hypTest !== "anova" && hypTest !== "chi2" && <><div>Crit: <strong>{fmt((hypResult as TestResult).criticalValue)}</strong></div><div>CI: <strong>{fmt((hypResult as TestResult).ciLower, 2)}-{fmt((hypResult as TestResult).ciUpper, 2)}</strong></div></>}<div>α: <strong>{hypAlpha}</strong></div></div>
                  <p className="text-xs">{hypResult.interpretation}</p>
                  <StepList steps={hypResult.steps} />
                  {["z1", "z2", "t1", "t2", "paired"].includes(hypTest) && <NormalCurve z={(hypResult as TestResult).statistic} alpha={hypAlpha} tail={hypTail} />}
                </div>
              )}
            </div>
          )}

          {tab === "power" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="text-xs space-y-1"><span className="text-muted-foreground">α</span><select value={pwAlpha} onChange={e => setPwAlpha(Number(e.target.value))} className="w-full rounded border border-border bg-background px-2 py-1 text-sm">{[0.001, 0.01, 0.05, 0.10].map(a => <option key={a} value={a}>{a}</option>)}</select></label>
                <label className="text-xs space-y-1"><span className="text-muted-foreground">n</span><input type="number" value={pwN} onChange={e => setPwN(Number(e.target.value))} min={1} className="w-full rounded border border-border bg-background px-2 py-1 text-sm" /></label>
                <label className="text-xs space-y-1"><span className="text-muted-foreground">Effect (d)</span><input type="number" value={pwEffect} onChange={e => setPwEffect(Number(e.target.value))} step={0.1} min={0.01} className="w-full rounded border border-border bg-background px-2 py-1 text-sm" /></label>
                <label className="text-xs space-y-1"><span className="text-muted-foreground">Tail</span><select value={pwTail} onChange={e => setPwTail(e.target.value as "two" | "one")} className="w-full rounded border border-border bg-background px-2 py-1 text-sm"><option value="two">Two</option><option value="one">One</option></select></label>
              </div>
              {pwResult && (
                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-card border border-border p-3 text-center"><div className="text-[10px] uppercase text-muted-foreground">Power</div><div className="mt-1 text-lg font-bold text-primary">{(pwResult.power * 100).toFixed(1)}%</div></div>
                    <div className="rounded-lg bg-card border border-border p-3 text-center"><div className="text-[10px] uppercase text-muted-foreground">β</div><div className="mt-1 text-lg font-bold text-amber-600">{(pwResult.beta * 100).toFixed(1)}%</div></div>
                    <div className="rounded-lg bg-card border border-border p-3 text-center"><div className="text-[10px] uppercase text-muted-foreground">α</div><div className="mt-1 text-lg font-bold text-red-500">{(pwAlpha * 100).toFixed(1)}%</div></div>
                  </div>
                  <p className="text-xs">{pwResult.interpretation}</p>
                  <div className="text-xs text-muted-foreground">Required n for 80% power: <strong className="text-foreground">{pwResult.requiredN}</strong></div>
                  <StepList steps={pwResult.steps} />
                </div>
              )}
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
                <p><strong className="text-foreground">α (Type I):</strong> False positive rate. Rejecting a true H₀.</p>
                <p><strong className="text-foreground">β (Type II):</strong> False negative rate. Failing to reject a false H₀.</p>
                <p><strong className="text-foreground">Power (1-β):</strong> True positive rate. Correctly detecting an effect. Target ≥ 0.80.</p>
              </div>
            </div>
          )}

          {tab === "distribution" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className="text-xs space-y-1"><span className="text-muted-foreground">z-score</span><input type="number" value={hypMu0} onChange={e => setHypMu0(Number(e.target.value))} step={0.1} className="w-full rounded border border-border bg-background px-2 py-1 text-sm" /></label>
                <label className="text-xs space-y-1"><span className="text-muted-foreground">α</span><select value={hypAlpha} onChange={e => setHypAlpha(Number(e.target.value))} className="w-full rounded border border-border bg-background px-2 py-1 text-sm">{[0.01, 0.05, 0.10].map(a => <option key={a} value={a}>{a}</option>)}</select></label>
                <label className="text-xs space-y-1"><span className="text-muted-foreground">Tail</span><select value={hypTail} onChange={e => setHypTail(e.target.value as Tail)} className="w-full rounded border border-border bg-background px-2 py-1 text-sm"><option value="two">Two</option><option value="right">Right</option><option value="left">Left</option></select></label>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <NormalCurve z={hypMu0} alpha={hypAlpha} tail={hypTail} />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>P(Z≤z): <strong>{fmt(normalCDF(hypMu0), 6)}</strong></div>
                  <div>{"P(Z>z)"}: <strong>{fmt(1 - normalCDF(hypMu0), 6)}</strong></div>
                  <div>Crit z: <strong>±{fmt(hypTail === "two" ? normalInv(1 - hypAlpha / 2) : normalInv(1 - hypAlpha))}</strong></div>
                  <div>Decision: <strong>{Math.abs(hypMu0) > (hypTail === "two" ? normalInv(1 - hypAlpha / 2) : normalInv(1 - hypAlpha)) ? "Reject H₀" : "Fail to reject"}</strong></div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}