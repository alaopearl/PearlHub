// ─── Statistical Math Engine ────────────────────────────────────────────────

// Error function approximation (Abramowitz & Stegun)
export function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453121344, a5 = 1.061405429, p = 0.327591582
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + p * ax)
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return sign * y
}

// Standard normal CDF: Φ(z)
export function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

// Inverse standard normal CDF (Acklam's rational approximation)
export function normalInv(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479496370494e1, 2.506628277459239e0]
  const b = [-5.447609879822407e1, 1.615858368580409e2, -1.556989598374315e2, 6.680131187570536e1, -1.328068155288572e1]
  const c = [-7.021531917259960e-4, -8.724542599871557e-1, 1.425493426199057e0, -6.144475932944970e0, 1.207699778461806e1, -1.036434979997251e1]
  const d = [2.545733212704084e0, 2.990921054912080e0, 1.136586134357914e0, 2.453073032211533e-1]
  const pLow = 0.02425, pHigh = 1 - pLow
  let q: number, r: number
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  } else if (p <= pHigh) {
    q = p - 0.5; r = q * q
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
}

// Log-gamma (Lanczos approximation)
function logGamma(x: number): number {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x)
  x -= 1
  let a = c[0]
  const t = x + g + 0.5
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i)
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

// Regularized incomplete beta function via continued fraction
function betaCF(a: number, b: number, x: number): number {
  const maxIter = 200, eps = 3e-12
  const qab = a + b, qap = a + 1, qam = a - 1
  let c = 1, d = 1 - qab * x / qap
  if (Math.abs(d) < 1e-30) d = 1e-30
  d = 1 / d
  let h = d
  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d; h *= d * c
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    const del = d * c; h *= del
    if (Math.abs(del - 1) < eps) break
  }
  return h
}

function regIncBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const lnBeta = logGamma(a) + logGamma(b) - logGamma(a + b)
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta)
  if (x < (a + 1) / (a + b + 2)) return front * betaCF(a, b, x) / a
  return 1 - Math.exp(Math.log(1 - x) * b + Math.log(x) * a - lnBeta) * betaCF(b, a, 1 - x) / b
}

// Student's t-distribution CDF
export function tCDF(t: number, df: number): number {
  if (df <= 0) return 0.5
  const x = df / (df + t * t)
  const p = 0.5 * regIncBeta(df / 2, 0.5, x)
  return t >= 0 ? 1 - p : p
}

// Two-tailed p-value for t-test
export function tPValue(t: number, df: number): number {
  return 2 * (1 - tCDF(Math.abs(t), df))
}

// Chi-square CDF
export function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0
  return regIncBeta(df / 2, 0.5, 1 - Math.exp(-x / 2)) // approximation via incomplete gamma
}

// Better chi-square CDF using regularized lower incomplete gamma
function regIncGamma(a: number, x: number): number {
  if (x < 0) return 0
  if (x === 0) return 0
  if (x < a + 1) {
    // Series representation
    let sum = 1 / a, term = 1 / a
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n)
      sum += term
      if (Math.abs(term) < 1e-12 * Math.abs(sum)) break
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a))
  } else {
    // Continued fraction
    let b = x + 1 - a, c = 1e30, d = 1 / b
    let h = d
    for (let i = 1; i < 200; i++) {
      const an = -i * (i - a)
      b += 2
      d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30
      c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30
      d = 1 / d
      const del = d * c
      h *= del
      if (Math.abs(del - 1) < 1e-12) break
    }
    return 1 - Math.exp(-x + a * Math.log(x) - logGamma(a)) * h
  }
}

export function chiSquareCDFProper(x: number, df: number): number {
  if (x <= 0) return 0
  return regIncGamma(df / 2, x / 2)
}

export function chiSquarePValue(stat: number, df: number): number {
  return 1 - chiSquareCDFProper(stat, df)
}

// F-distribution CDF
export function fCDF(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0
  const x = df1 * f / (df1 * f + df2)
  return regIncBeta(df1 / 2, df2 / 2, x)
}

export function fPValue(f: number, df1: number, df2: number): number {
  return 1 - fCDF(f, df1, df2)
}

// ─── Descriptive Statistics ─────────────────────────────────────────────────

export interface DescriptiveStats {
  n: number; sum: number; mean: number; median: number; mode: number[]
  trimmedMean: number; geometricMean: number; harmonicMean: number
  variance: number; popVariance: number; stdDev: number; popStdDev: number
  sem: number; min: number; max: number; range: number
  q1: number; q3: number; iqr: number
  skewness: number; kurtosis: number; sumOfSquares: number
}

export function descriptiveStats(data: number[]): DescriptiveStats {
  const n = data.length
  const sorted = [...data].sort((a, b) => a - b)
  const sum = data.reduce((a, b) => a + b, 0)
  const mean = sum / n
  const mid = Math.floor(n / 2)
  const median = n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2

  // Mode
  const freq = new Map<number, number>()
  data.forEach(v => freq.set(v, (freq.get(v) || 0) + 1))
  const maxF = Math.max(...freq.values())
  const mode = maxF > 1 ? [...freq.entries()].filter(([, c]) => c === maxF).map(([k]) => k) : []

  // Trimmed mean (10%)
  const trimCount = Math.floor(n * 0.1)
  const trimmed = sorted.slice(trimCount, n - trimCount)
  const trimmedMean = trimmed.reduce((a, b) => a + b, 0) / trimmed.length

  // Geometric mean
  const logSum = data.filter(v => v > 0).reduce((a, v) => a + Math.log(v), 0)
  const geometricMean = data.every(v => v > 0) ? Math.exp(logSum / n) : NaN

  // Harmonic mean
  const recipSum = data.filter(v => v !== 0).reduce((a, v) => a + 1 / v, 0)
  const harmonicMean = recipSum !== 0 ? n / recipSum : NaN

  // Variance & Std Dev
  const ss = data.reduce((a, v) => a + (v - mean) ** 2, 0)
  const variance = n > 1 ? ss / (n - 1) : 0
  const popVariance = ss / n
  const stdDev = Math.sqrt(variance)
  const popStdDev = Math.sqrt(popVariance)
  const sem = n > 0 ? stdDev / Math.sqrt(n) : 0

  // Quartiles
  const q1 = percentile(sorted, 25)
  const q3 = percentile(sorted, 75)
  const iqr = q3 - q1

  // Skewness (Fisher-Pearson)
  const skewness = n > 2 ? (n / ((n - 1) * (n - 2))) * data.reduce((a, v) => a + ((v - mean) / stdDev) ** 3, 0) : 0

  // Excess Kurtosis
  const kurtosis = n > 3 ? ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * data.reduce((a, v) => a + ((v - mean) / stdDev) ** 4, 0) - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3)) : 0

  return { n, sum, mean, median, mode, trimmedMean, geometricMean, harmonicMean, variance, popVariance, stdDev, popStdDev, sem, min: sorted[0], max: sorted[n - 1], range: sorted[n - 1] - sorted[0], q1, q3, iqr, skewness, kurtosis, sumOfSquares: ss }
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx), hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

// ─── Hypothesis Tests ───────────────────────────────────────────────────────

export interface TestResult {
  statistic: number; pValue: number; df?: number
  criticalValue: number; reject: boolean
  ciLower: number; ciUpper: number
  interpretation: string
  steps: string[]
}

// One-sample Z-test
export function oneSampleZTest(data: number[], mu0: number, sigma: number, alpha: number, tail: "two" | "left" | "right"): TestResult {
  const n = data.length
  const xbar = data.reduce((a, b) => a + b, 0) / n
  const z = (xbar - mu0) / (sigma / Math.sqrt(n))
  const pValue = tail === "two" ? 2 * (1 - normalCDF(Math.abs(z))) : tail === "right" ? 1 - normalCDF(z) : normalCDF(z)
  const zCrit = tail === "two" ? normalInv(1 - alpha / 2) : normalInv(1 - alpha)
  const reject = tail === "two" ? Math.abs(z) > zCrit : tail === "right" ? z > zCrit : z < -zCrit
  const se = sigma / Math.sqrt(n)
  const zHalf = normalInv(1 - alpha / 2)
  return {
    statistic: z, pValue, criticalValue: zCrit, reject,
    ciLower: xbar - zHalf * se, ciUpper: xbar + zHalf * se,
    interpretation: reject ? `Reject H₀: p=${pValue.toFixed(4)} < α=${alpha}. Significant difference from μ₀=${mu0}.` : `Fail to reject H₀: p=${pValue.toFixed(4)} ≥ α=${alpha}. No significant difference from μ₀=${mu0}.`,
    steps: [`x̄ = ${xbar.toFixed(4)}, n = ${n}, σ = ${sigma}, μ₀ = ${mu0}`, `SE = σ/√n = ${sigma}/√${n} = ${se.toFixed(4)}`, `z = (x̄ - μ₀)/SE = (${xbar.toFixed(4)} - ${mu0})/${se.toFixed(4)} = ${z.toFixed(4)}`, `p-value (${tail === "two" ? "two-tailed" : tail + "-tailed"}) = ${pValue.toFixed(6)}`, `Critical z = ±${zCrit.toFixed(4)} at α = ${alpha}`, `Decision: ${reject ? "REJECT H₀" : "FAIL TO REJECT H₀"}`]
  }
}

// Two-sample Z-test
export function twoSampleZTest(x1: number, s1: number, n1: number, x2: number, s2: number, n2: number, d0: number, alpha: number, tail: "two" | "left" | "right"): TestResult {
  const se = Math.sqrt(s1 * s1 / n1 + s2 * s2 / n2)
  const z = (x1 - x2 - d0) / se
  const pValue = tail === "two" ? 2 * (1 - normalCDF(Math.abs(z))) : tail === "right" ? 1 - normalCDF(z) : normalCDF(z)
  const zCrit = tail === "two" ? normalInv(1 - alpha / 2) : normalInv(1 - alpha)
  const reject = tail === "two" ? Math.abs(z) > zCrit : tail === "right" ? z > zCrit : z < -zCrit
  const zHalf = normalInv(1 - alpha / 2)
  const diff = x1 - x2
  return {
    statistic: z, pValue, criticalValue: zCrit, reject,
    ciLower: diff - zHalf * se, ciUpper: diff + zHalf * se,
    interpretation: reject ? `Reject H₀: p=${pValue.toFixed(4)} < α=${alpha}. Means differ significantly.` : `Fail to reject H₀: p=${pValue.toFixed(4)} ≥ α=${alpha}. No significant difference.`,
    steps: [`x̄₁=${x1}, σ₁=${s1}, n₁=${n1}`, `x̄₂=${x2}, σ₂=${s2}, n₂=${n2}`, `SE = √(σ₁²/n₁ + σ₂²/n₂) = ${se.toFixed(4)}`, `z = (x̄₁-x̄₂-d₀)/SE = (${x1}-${x2}-${d0})/${se.toFixed(4)} = ${z.toFixed(4)}`, `p-value = ${pValue.toFixed(6)}`, `Decision: ${reject ? "REJECT H₀" : "FAIL TO REJECT H₀"}`]
  }
}

// One-sample T-test
export function oneSampleTTest(data: number[], mu0: number, alpha: number, tail: "two" | "left" | "right"): TestResult {
  const n = data.length
  const xbar = data.reduce((a, b) => a + b, 0) / n
  const s = Math.sqrt(data.reduce((a, v) => a + (v - xbar) ** 2, 0) / (n - 1))
  const df = n - 1
  const t = (xbar - mu0) / (s / Math.sqrt(n))
  const pValue = tail === "two" ? tPValue(t, df) : tail === "right" ? 1 - tCDF(t, df) : tCDF(t, df)
  const tCrit = tail === "two" ? tInv(1 - alpha / 2, df) : tInv(1 - alpha, df)
  const reject = tail === "two" ? Math.abs(t) > tCrit : tail === "right" ? t > tCrit : t < -tCrit
  const se = s / Math.sqrt(n)
  const tHalf = tInv(1 - alpha / 2, df)
  return {
    statistic: t, pValue, df, criticalValue: tCrit, reject,
    ciLower: xbar - tHalf * se, ciUpper: xbar + tHalf * se,
    interpretation: reject ? `Reject H₀: p=${pValue.toFixed(4)} < α=${alpha}. Mean differs significantly from μ₀=${mu0}.` : `Fail to reject H₀: p=${pValue.toFixed(4)} ≥ α=${alpha}.`,
    steps: [`x̄ = ${xbar.toFixed(4)}, s = ${s.toFixed(4)}, n = ${n}, df = ${df}`, `SE = s/√n = ${se.toFixed(4)}`, `t = (x̄ - μ₀)/SE = ${t.toFixed(4)}`, `p-value = ${pValue.toFixed(6)}`, `Critical t = ±${tCrit.toFixed(4)}`, `Decision: ${reject ? "REJECT H₀" : "FAIL TO REJECT H₀"}`]
  }
}

// Independent two-sample T-test (pooled / Welch)
export function twoSampleTTest(d1: number[], d2: number[], alpha: number, tail: "two" | "left" | "right", welch: boolean): TestResult {
  const n1 = d1.length, n2 = d2.length
  const x1 = d1.reduce((a, b) => a + b, 0) / n1
  const x2 = d2.reduce((a, b) => a + b, 0) / n2
  const v1 = d1.reduce((a, v) => a + (v - x1) ** 2, 0) / (n1 - 1)
  const v2 = d2.reduce((a, v) => a + (v - x2) ** 2, 0) / (n2 - 1)
  let df: number, se: number
  if (welch) {
    se = Math.sqrt(v1 / n1 + v2 / n2)
    df = (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1))
  } else {
    const sp = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2))
    se = sp * Math.sqrt(1 / n1 + 1 / n2)
    df = n1 + n2 - 2
  }
  const t = (x1 - x2) / se
  const pValue = tail === "two" ? tPValue(t, Math.round(df)) : tail === "right" ? 1 - tCDF(t, Math.round(df)) : tCDF(t, Math.round(df))
  const tCrit = tInv(1 - alpha / 2, Math.round(df))
  const reject = tail === "two" ? Math.abs(t) > tCrit : tail === "right" ? t > tCrit : t < -tCrit
  const tHalf = tInv(1 - alpha / 2, Math.round(df))
  const diff = x1 - x2
  return {
    statistic: t, pValue, df: Math.round(df), criticalValue: tCrit, reject,
    ciLower: diff - tHalf * se, ciUpper: diff + tHalf * se,
    interpretation: reject ? `Reject H₀: p=${pValue.toFixed(4)} < α=${alpha}. Group means differ significantly.` : `Fail to reject H₀: p=${pValue.toFixed(4)} ≥ α=${alpha}.`,
    steps: [`x̄₁=${x1.toFixed(4)}, s₁²=${v1.toFixed(4)}, n₁=${n1}`, `x̄₂=${x2.toFixed(4)}, s₂²=${v2.toFixed(4)}, n₂=${n2}`, `${welch ? "Welch" : "Pooled"} SE = ${se.toFixed(4)}, df = ${Math.round(df)}`, `t = ${t.toFixed(4)}`, `p-value = ${pValue.toFixed(6)}`, `Decision: ${reject ? "REJECT H₀" : "FAIL TO REJECT H₀"}`]
  }
}

// Paired T-test
export function pairedTTest(d1: number[], d2: number[], alpha: number, tail: "two" | "left" | "right"): TestResult {
  const diffs = d1.map((v, i) => v - d2[i])
  return oneSampleTTest(diffs, 0, alpha, tail)
}

// One-way ANOVA
export interface ANOVAResult {
  fStat: number; pValue: number; dfBetween: number; dfWithin: number
  ssBetween: number; ssWithin: number; msBetween: number; msWithin: number
  reject: boolean; interpretation: string; steps: string[]
}

export function oneWayANOVA(groups: number[][], alpha: number): ANOVAResult {
  const k = groups.length
  const N = groups.reduce((a, g) => a + g.length, 0)
  const grandMean = groups.flat().reduce((a, b) => a + b, 0) / N
  const ssBetween = groups.reduce((a, g) => a + g.length * ((g.reduce((x, y) => x + y, 0) / g.length - grandMean) ** 2), 0)
  const ssWithin = groups.reduce((a, g) => { const gm = g.reduce((x, y) => x + y, 0) / g.length; return a + g.reduce((x, v) => x + (v - gm) ** 2, 0) }, 0)
  const dfBetween = k - 1, dfWithin = N - k
  const msBetween = ssBetween / dfBetween, msWithin = ssWithin / dfWithin
  const f = msBetween / msWithin
  const pValue = fPValue(f, dfBetween, dfWithin)
  const reject = pValue < alpha
  return {
    fStat: f, pValue, dfBetween, dfWithin, ssBetween, ssWithin, msBetween, msWithin, reject,
    interpretation: reject ? `Reject H₀: F(${dfBetween},${dfWithin})=${f.toFixed(4)}, p=${pValue.toFixed(6)} < α=${alpha}. At least one group mean differs.` : `Fail to reject H₀: p=${pValue.toFixed(6)} ≥ α=${alpha}. No significant difference between groups.`,
    steps: [`Grand mean = ${grandMean.toFixed(4)}, k = ${k}, N = ${N}`, `SS_between = ${ssBetween.toFixed(4)}, df = ${dfBetween}, MS = ${msBetween.toFixed(4)}`, `SS_within = ${ssWithin.toFixed(4)}, df = ${dfWithin}, MS = ${msWithin.toFixed(4)}`, `F = MS_between/MS_within = ${f.toFixed(4)}`, `p-value = ${pValue.toFixed(6)}`, `Decision: ${reject ? "REJECT H₀" : "FAIL TO REJECT H₀"}`]
  }
}

// Chi-square test of independence / goodness of fit
export interface ChiSquareResult {
  stat: number; pValue: number; df: number; reject: boolean
  interpretation: string; steps: string[]
}

export function chiSquareTest(observed: number[], expected: number[], alpha: number): ChiSquareResult {
  const stat = observed.reduce((a, o, i) => a + (o - expected[i]) ** 2 / expected[i], 0)
  const df = observed.length - 1
  const pValue = chiSquarePValue(stat, df)
  const reject = pValue < alpha
  return {
    stat, pValue, df, reject,
    interpretation: reject ? `Reject H₀: χ²=${stat.toFixed(4)}, p=${pValue.toFixed(6)} < α=${alpha}. Observed differs from expected.` : `Fail to reject H₀: p=${pValue.toFixed(6)} ≥ α=${alpha}.`,
    steps: [`χ² = Σ(O-E)²/E = ${stat.toFixed(4)}`, `df = ${df}`, `p-value = ${pValue.toFixed(6)}`, `Decision: ${reject ? "REJECT H₀" : "FAIL TO REJECT H₀"}`]
  }
}

// ─── Power & Beta ───────────────────────────────────────────────────────────

export interface PowerResult {
  power: number; beta: number; zAlpha: number; zBeta: number
  effectSize: number; n: number; requiredN: number
  interpretation: string; steps: string[]
}

export function computePower(alpha: number, n: number, effectSize: number, tail: "two" | "one"): PowerResult {
  const zAlpha = tail === "two" ? normalInv(1 - alpha / 2) : normalInv(1 - alpha)
  const se = 1 / Math.sqrt(n)
  const zBeta = effectSize / se - zAlpha
  const beta = normalCDF(-zBeta)
  const power = 1 - beta
  const requiredN = tail === "two" ? Math.ceil(((zAlpha + normalInv(0.8)) / effectSize) ** 2) : Math.ceil(((zAlpha + normalInv(0.8)) / effectSize) ** 2)
  return {
    power, beta, zAlpha, zBeta, effectSize, n, requiredN,
    interpretation: `Power = ${(power * 100).toFixed(1)}%. β = ${(beta * 100).toFixed(1)}%. ${power >= 0.8 ? "Adequate power (≥80%)." : "Low power. Consider increasing sample size."}`,
    steps: [`α = ${alpha}, n = ${n}, d = ${effectSize}`, `z_α = ${zAlpha.toFixed(4)} (${tail === "two" ? "two-tailed" : "one-tailed"})`, `SE = 1/√n = ${se.toFixed(4)}`, `z_β = d/SE - z_α = ${zBeta.toFixed(4)}`, `β = Φ(-z_β) = ${beta.toFixed(4)}`, `Power = 1 - β = ${power.toFixed(4)}`, `Required n for 80% power = ${requiredN}`]
  }
}

// T-distribution inverse (approximation via binary search)
export function tInv(p: number, df: number): number {
  let lo = -10, hi = 10
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (tCDF(mid, df) < p) lo = mid; else hi = mid
  }
  return (lo + hi) / 2
}

// Confidence interval for proportion
export function proportionCI(p: number, n: number, alpha: number): { lower: number; upper: number; margin: number } {
  const z = normalInv(1 - alpha / 2)
  const se = Math.sqrt(p * (1 - p) / n)
  return { lower: p - z * se, upper: p + z * se, margin: z * se }
}
