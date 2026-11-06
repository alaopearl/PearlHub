import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  QrCode, Link2, Type, Wifi, Mail, Contact, Download, Copy,
  FileText, Share2, Palette,
} from "lucide-react";

type Mode = "url" | "text" | "wifi" | "email" | "contact";

const MODES: { id: Mode; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "url", label: "URL", Icon: Link2 },
  { id: "text", label: "Text", Icon: Type },
  { id: "wifi", label: "WiFi", Icon: Wifi },
  { id: "email", label: "Email", Icon: Mail },
  { id: "contact", label: "Contact", Icon: Contact },
];

const EC_OPTIONS: { label: string; value: "L" | "M" | "Q" | "H" }[] = [
  { label: "Low (7%)", value: "L" },
  { label: "Medium (15%)", value: "M" },
  { label: "Quartile (25%)", value: "Q" },
  { label: "High (30%)", value: "H" },
];

const inputCls =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

export function QrStudio() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [ssid, setSsid] = useState("");
  const [pass, setPass] = useState("");
  const [sec, setSec] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [cName, setCName] = useState("");
  const [cOrg, setCOrg] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cEmail, setCEmail] = useState("");

  const [ec, setEc] = useState<"L" | "M" | "Q" | "H">("M");
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [dark, setDark] = useState("#0f172a");
  const [light, setLight] = useState("#ffffff");

  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const content = useMemo(() => {
    if (mode === "url") return url.trim();
    if (mode === "text") return text;
    if (mode === "wifi") {
      if (!ssid.trim()) return "";
      const p = sec === "nopass" ? "" : `P:${pass.replace(/([\\;:,"])/g, "\\$1")};`;
      return `WIFI:T:${sec};S:${ssid.replace(/([\\;:,"])/g, "\\$1")};${p}${hidden ? "H:true;" : ""};`;
    }
    if (mode === "email") {
      if (!to.trim()) return "";
      const q: string[] = [];
      if (subject.trim()) q.push(`subject=${encodeURIComponent(subject)}`);
      if (body.trim()) q.push(`body=${encodeURIComponent(body)}`);
      return `mailto:${to.trim()}${q.length ? "?" + q.join("&") : ""}`;
    }
    if (mode === "contact") {
      if (!cName.trim() && !cPhone.trim() && !cEmail.trim()) return "";
      return [
        "BEGIN:VCARD", "VERSION:3.0",
        `FN:${cName}`, cOrg ? `ORG:${cOrg}` : "",
        cPhone ? `TEL;TYPE=CELL:${cPhone}` : "",
        cEmail ? `EMAIL:${cEmail}` : "", "END:VCARD",
      ].filter(Boolean).join(String.fromCharCode(10));
    }
    return "";
  }, [mode, url, text, ssid, pass, sec, hidden, to, subject, body, cName, cOrg, cPhone, cEmail]);

  useEffect(() => {
    let active = true;
    if (!content) { setDataUrl(null); setError(null); return; }
    QRCode.toDataURL(content, {
      errorCorrectionLevel: ec,
      margin,
      width: size,
      color: { dark, light },
    })
      .then((d) => { if (active) { setDataUrl(d); setError(null); } })
      .catch((e: unknown) => { if (active) { setDataUrl(null); setError(e instanceof Error ? e.message : "Unable to generate QR code."); } });
    return () => { active = false; };
  }, [content, ec, margin, size, dark, light]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
    toast.success("PNG downloaded");
  };

  const downloadSvg = async () => {
    if (!content) return;
    try {
      const svg = await QRCode.toString(content, {
        type: "svg", errorCorrectionLevel: ec, margin, width: size, color: { dark, light },
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("SVG downloaded");
    } catch {
      toast.error("Could not export SVG");
    }
  };

  const copyImage = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      toast.success("QR image copied to clipboard");
    } catch {
      toast.error("Clipboard image copy is not supported here");
    }
  };

  const field = (label: string, node: React.ReactNode) => (
    <div><label className={labelCls}>{label}</label>{node}</div>
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">QR Code Studio</h2>
      </div>

      {/* Mode tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <m.Icon className="h-4 w-4" /> {m.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Inputs */}
        <div className="space-y-4">
          {mode === "url" && field("URL", <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://pearlhub.com" />)}
          {mode === "text" && field("Text", <textarea className={inputCls} rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Any text to encode" />)}
          {mode === "wifi" && (
            <div className="space-y-4">
              {field("Network Name (SSID)", <input className={inputCls} value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="MyNetwork" />)}
              {field("Password", <input className={inputCls} type="text" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" disabled={sec === "nopass"} />)}
              <div className="grid grid-cols-2 gap-4">
                {field("Security", (
                  <select className={inputCls} value={sec} onChange={(e) => setSec(e.target.value)}>
                    <option value="WPA">WPA / WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                ))}
                <label className="flex items-end gap-2 pb-2.5 text-sm text-foreground">
                  <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="h-4 w-4 accent-primary" />
                  Hidden network
                </label>
              </div>
            </div>
          )}
          {mode === "email" && (
            <div className="space-y-4">
              {field("Recipient", <input className={inputCls} type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com" />)}
              {field("Subject", <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />)}
              {field("Message", <textarea className={inputCls} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />)}
            </div>
          )}
          {mode === "contact" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {field("Full Name", <input className={inputCls} value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Jane Doe" />)}
                {field("Organization", <input className={inputCls} value={cOrg} onChange={(e) => setCOrg(e.target.value)} placeholder="Company" />)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field("Phone", <input className={inputCls} value={cPhone} onChange={(e) => setCPhone(e.target.value)} placeholder="+234..." />)}
                {field("Email", <input className={inputCls} value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="jane@example.com" />)}
              </div>
            </div>
          )}

          {/* Customization */}
          <div className="mt-2 rounded-lg border border-border bg-muted/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Palette className="h-4 w-4 text-primary" /> Customization
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Error Correction</label>
                <select className={inputCls} value={ec} onChange={(e) => setEc(e.target.value as "L" | "M" | "Q" | "H")}>
                  {EC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Size: {size}px</label>
                <input type="range" min={128} max={512} step={16} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className={labelCls}>Margin: {margin}</label>
                <input type="range" min={0} max={8} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Foreground</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-border bg-background" />
                    <input className={inputCls} value={dark} onChange={(e) => setDark(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-border bg-background" />
                    <input className={inputCls} value={light} onChange={(e) => setLight(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-4" style={{ minHeight: 280 }}>
            {error ? (
              <div className="text-center text-sm text-red-500">{error}</div>
            ) : dataUrl ? (
              <motion.img
                key={dataUrl}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={dataUrl}
                alt="Generated QR code"
                className="rounded-lg"
                style={{ width: "100%", maxWidth: 256, height: "auto" }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                <QrCode className="h-10 w-10 opacity-40" />
                Enter {mode === "url" ? "a URL" : mode === "text" ? "some text" : mode === "wifi" ? "network details" : mode === "email" ? "an email" : "contact details"} to generate a QR code.
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="grid grid-cols-2 gap-2">
            <button onClick={downloadPng} disabled={!dataUrl} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">
              <Download className="h-4 w-4" /> PNG
            </button>
            <button onClick={downloadSvg} disabled={!content} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40">
              <FileText className="h-4 w-4" /> SVG
            </button>
            <button onClick={copyImage} disabled={!dataUrl} className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40">
              <Copy className="h-4 w-4" /> Copy Image
            </button>
            <button
              onClick={async () => {
                if (!content) return;
                try {
                  if (navigator.share) {
                    await navigator.share({ title: "QR Code", text: content });
                  } else {
                    await navigator.clipboard.writeText(content);
                    toast.success("Encoded content copied");
                  }
                } catch { /* user cancelled */ }
              }}
              disabled={!content}
              className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Share2 className="h-4 w-4" /> Share / Copy Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}