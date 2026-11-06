import { normalInv, normalCDF } from "@/lib/statistics";

type Tail = "two" | "left" | "right";

export function fmt(v: number, d = 4): string { return Number.isFinite(v) ? v.toFixed(d) : "N/A"; }

export function ResultBadge({ reject }: { reject: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${reject ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
      {reject ? "Reject H₀" : "Fail to Reject H₀"}
    </span>
  );
}

export function StepList({ steps }: { steps: string[] }) {
  return (
    <div className="mt-3 space-y-1.5 rounded-lg bg-muted/50 p-3 border border-border">
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
          <code className="font-mono leading-relaxed">{s}</code>
        </div>
      ))}
    </div>
  );
}

export function NormalCurve({ z, alpha, tail }: { z: number; alpha: number; tail: Tail }) {
  const w = 320, h = 140, cx = w / 2, cy = h - 20, scaleX = 45;
  const pts: string[] = [];
  for (let px = -4; px <= 4; px += 0.05) {
    const y = Math.exp(-0.5 * px * px) / Math.sqrt(2 * Math.PI);
    pts.push(`${cx + px * scaleX},${cy - y * 100}`);
  }
  const path = `M${cx - 4 * scaleX},${cy} L${pts.join(" L")} L${cx + 4 * scaleX},${cy} Z`;
  const zCrit = tail === "two" ? normalInv(1 - alpha / 2) : normalInv(1 - alpha);
  const shadeL: string[] = [], shadeR: string[] = [];
  if (tail === "two" || tail === "left") {
    for (let px = -4; px <= (tail === "two" ? -zCrit : z); px += 0.05) {
      const y = Math.exp(-0.5 * px * px) / Math.sqrt(2 * Math.PI);
      shadeL.push(`${cx + px * scaleX},${cy - y * 100}`);
    }
  }
  if (tail === "two" || tail === "right") {
    for (let px = (tail === "two" ? zCrit : z); px <= 4; px += 0.05) {
      const y = Math.exp(-0.5 * px * px) / Math.sqrt(2 * Math.PI);
      shadeR.push(`${cx + px * scaleX},${cy - y * 100}`);
    }
  }
  const zPos = cx + Math.max(-4, Math.min(4, z)) * scaleX;
  const critPos = cx + Math.max(-4, Math.min(4, zCrit)) * scaleX;
  const negCritPos = cx - Math.max(-4, Math.min(4, zCrit)) * scaleX;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[360px] mx-auto mt-3">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-muted-foreground/40" />
      {shadeL.length > 1 && <polygon points={`${cx - 4 * scaleX},${cy} ${shadeL.join(" ")} ${shadeL[shadeL.length - 1].split(",")[0]},${cy}`} fill="currentColor" opacity={0.2} className="text-red-500" />}
      {shadeR.length > 1 && <polygon points={`${shadeR[0].split(",")[0]},${cy} ${shadeR.join(" ")} ${cx + 4 * scaleX},${cy}`} fill="currentColor" opacity={0.2} className="text-red-500" />}
      <line x1={zPos} y1={10} x2={zPos} y2={cy} stroke="currentColor" strokeWidth={1.5} strokeDasharray="3,2" className="text-primary" />
      {tail === "two" && <line x1={negCritPos} y1={20} x2={negCritPos} y2={cy} stroke="currentColor" strokeWidth={1} strokeDasharray="2,2" className="text-red-400" />}
      <line x1={critPos} y1={20} x2={critPos} y2={cy} stroke="currentColor" strokeWidth={1} strokeDasharray="2,2" className="text-red-400" />
      <text x={zPos} y={12} textAnchor="middle" className="fill-primary text-[9px] font-mono">z={fmt(z, 2)}</text>
    </svg>
  );
}

export function parseNums(raw: string): number[] {
  return raw.split(/[,;\s]+/).map(Number).filter(n => !isNaN(n));
}

export { normalCDF, normalInv };