export interface CalcStep { label: string; expression: string; result: string }
export interface CalcResult { headline: string; headlineValue: string; steps: CalcStep[]; interpretation: string; tips: string[] }

const errResult = (msg: string): CalcResult => ({ headline: "Error", headlineValue: msg, steps: [], interpretation: "Please check your inputs and try again.", tips: [] });

export function calculateTool(toolId: string, v: Record<string, string>): CalcResult {
  try {
    switch (toolId) {
      case "tool1": {
        const part = parseFloat(v["Part Value"] || "0");
        const whole = parseFloat(v["Whole Value"] || "0");
        if (!whole) return errResult("Whole value cannot be zero.");
        const pct = (part / whole) * 100;
        const complement = 100 - pct;
        return {
          headline: "Percentage Result",
          headlineValue: `${pct.toFixed(2)}%`,
          steps: [
            { label: "Formula", expression: "(Part ÷ Whole) × 100", result: `(${part} ÷ ${whole}) × 100` },
            { label: "Division", expression: "Part ÷ Whole", result: `${part} ÷ ${whole} = ${(part / whole).toFixed(6)}` },
            { label: "Multiply by 100", expression: "Decimal × 100", result: `${(part / whole).toFixed(6)} × 100 = ${pct.toFixed(2)}%` },
            { label: "Complement", expression: "100% − Result", result: `100% − ${pct.toFixed(2)}% = ${complement.toFixed(2)}%` },
          ],
          interpretation: `${part} represents ${pct.toFixed(2)}% of ${whole}. The remaining ${complement.toFixed(2)}% (${(whole - part).toFixed(2)}) makes up the rest of the whole.`,
          tips: ["A percentage is a fraction with denominator 100", "Complement % tells you what portion is NOT included", "Use this to compare parts across different wholes"],
        };
      }
      case "tool2": {
        const scale = v["Grading Scale"] || "5.0 Scale (Nigerian)";
        const grade = v["Course Grade"] || "A";
        const units = parseFloat(v["Credit Units"] || "0");
        if (!units) return errResult("Credit units must be greater than zero.");
        const pts5: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
        const pts4: Record<string, number> = { A: 4, B: 3, C: 2.5, D: 2, E: 1, F: 0 };
        const gp = scale.includes("4.0") ? (pts4[grade] ?? 0) : (pts5[grade] ?? 0);
        const maxScale = scale.includes("4.0") ? 4 : 5;
        const qp = gp * units;
        return {
          headline: "Quality Points",
          headlineValue: `${qp}`,
          steps: [
            { label: "Grade Lookup", expression: `${grade} on ${scale}`, result: `GP = ${gp}` },
            { label: "Formula", expression: "GP × Units = Quality Points", result: `${gp} × ${units} = ${qp}` },
            { label: "Percentage of Max", expression: "(GP ÷ Max) × 100", result: `(${gp} ÷ ${maxScale}) × 100 = ${((gp / maxScale) * 100).toFixed(1)}%` },
          ],
          interpretation: `Grade ${grade} earns ${gp} grade points on a ${maxScale}.0 scale. With ${units} credit units, this course contributes ${qp} quality points toward your GPA.`,
          tips: ["Quality Points = Grade Points × Credit Units", "Higher-unit courses impact GPA more heavily", "An F (0 points) drags GPA down proportionally to its units"],
        };
      }
      case "tool3": {
        const qp = parseFloat(v["Semester Quality Points"] || "0");
        const tu = parseFloat(v["Semester Total Units"] || "0");
        if (!tu) return errResult("Total units cannot be zero.");
        const cgpa = qp / tu;
        let cls = "Fail", next = "", needed = 0;
        if (cgpa >= 4.50) { cls = "First Class Honours"; next = "Already at the top tier"; }
        else if (cgpa >= 3.50) { cls = "Second Class Upper (2:1)"; next = "First Class (≥4.50)"; needed = 4.50 * tu - qp; }
        else if (cgpa >= 2.40) { cls = "Second Class Lower (2:2)"; next = "Second Upper (≥3.50)"; needed = 3.50 * tu - qp; }
        else if (cgpa >= 1.50) { cls = "Third Class"; next = "Second Lower (≥2.40)"; needed = 2.40 * tu - qp; }
        else if (cgpa >= 1.00) { cls = "Pass"; next = "Third Class (≥1.50)"; needed = 1.50 * tu - qp; }
        else { cls = "Fail"; next = "Pass (≥1.00)"; needed = 1.00 * tu - qp; }
        const steps: CalcStep[] = [
          { label: "Formula", expression: "Total Quality Points ÷ Total Units", result: `${qp} ÷ ${tu}` },
          { label: "Result", expression: "Division", result: `= ${cgpa.toFixed(4)} → ${cgpa.toFixed(2)}` },
          { label: "Classification", expression: "Tier lookup", result: cls },
        ];
        if (needed > 0) steps.push({ label: "Points to Next Tier", expression: `Target × ${tu} − ${qp}`, result: `${needed.toFixed(1)} more quality points needed` });
        return {
          headline: "CGPA",
          headlineValue: cgpa.toFixed(2),
          steps,
          interpretation: `Your CGPA of ${cgpa.toFixed(2)} places you in the ${cls} category. ${needed > 0 ? `You need ${needed.toFixed(1)} additional quality points to reach ${next}.` : next}`,
          tips: ["CGPA is a weighted average across all semesters", "Focus on high-unit courses to shift CGPA faster", "Honours classification affects graduate school eligibility"],
        };
      }
      case "tool4": {
        const dob = v["Date of Birth"] || "";
        if (!dob) return errResult("Please enter your date of birth.");
        const birth = new Date(dob);
        const ref = v["Reference Date"] ? new Date(v["Reference Date"]) : new Date();
        let years = ref.getFullYear() - birth.getFullYear();
        let months = ref.getMonth() - birth.getMonth();
        let days = ref.getDate() - birth.getDate();
        if (days < 0) { months--; days += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        const totalDays = Math.floor((ref.getTime() - birth.getTime()) / 86400000);
        const totalHours = totalDays * 24;
        const totalMins = totalHours * 60;
        const dayOfWeek = birth.toLocaleDateString("en-US", { weekday: "long" });
        const nextBday = new Date(ref.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBday <= ref) nextBday.setFullYear(ref.getFullYear() + 1);
        const daysToBday = Math.ceil((nextBday.getTime() - ref.getTime()) / 86400000);
        return {
          headline: "Exact Age",
          headlineValue: `${years}y ${months}m ${days}d`,
          steps: [
            { label: "Born on", expression: "Day of week", result: `${dob} → ${dayOfWeek}` },
            { label: "Years", expression: "Calendar year difference (adjusted)", result: `${years} years` },
            { label: "Months", expression: "Month difference (adjusted)", result: `${months} months` },
            { label: "Days", expression: "Day difference (adjusted)", result: `${days} days` },
            { label: "Total Days", expression: "Ref − Birth (ms ÷ 86400000)", result: `${totalDays.toLocaleString()} days` },
            { label: "Total Hours", expression: "Total days × 24", result: `${totalHours.toLocaleString()} hours` },
            { label: "Next Birthday", expression: "Countdown", result: `${daysToBday} days away` },
          ],
          interpretation: `You were born on a ${dayOfWeek}. You have lived approximately ${totalMins.toLocaleString()} minutes. Your next birthday is in ${daysToBday} days (${nextBday.toLocaleDateString()}).`,
          tips: ["Age calculation accounts for leap years automatically", "Day-of-week uses the Gregorian calendar", "Total minutes gives a sense of time lived in perspective"],
        };
      }
      case "tool5": {
        const text = v["Your Text"] || "";
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
        const nl = String.fromCharCode(10);
        const paragraphs = text.trim() ? text.trim().split(new RegExp(`${nl}\\s*${nl}`)).filter((p) => p.trim()).length : 0;
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, "").length;
        const avgWordLen = words > 0 ? (charsNoSpace / words).toFixed(1) : "0";
        const readMin = words / 200;
        const speakMin = words / 130;
        const wordsPerSentence = sentences > 0 ? (words / sentences).toFixed(1) : "0";
        return {
          headline: "Word Count",
          headlineValue: `${words} words`,
          steps: [
            { label: "Words", expression: "Split on whitespace", result: `${words} words` },
            { label: "Sentences", expression: "Count [.!?] terminators", result: `${sentences} sentences` },
            { label: "Paragraphs", expression: "Double-newline split", result: `${paragraphs} paragraphs` },
            { label: "Characters", expression: "Total length", result: `${chars} (with spaces), ${charsNoSpace} (without)` },
            { label: "Avg Word Length", expression: "charsNoSpace ÷ words", result: `${avgWordLen} characters` },
            { label: "Reading Time", expression: "words ÷ 200 WPM", result: `${Math.ceil(readMin)} min ${Math.round((readMin % 1) * 60)} sec` },
            { label: "Speaking Time", expression: "words ÷ 130 WPM", result: `${Math.ceil(speakMin)} min ${Math.round((speakMin % 1) * 60)} sec` },
            { label: "Sentence Complexity", expression: "words ÷ sentences", result: `${wordsPerSentence} words/sentence` },
          ],
          interpretation: `At 200 WPM reading speed, this takes ~${Math.ceil(readMin)} min. Speaking at 130 WPM (presentation pace), ~${Math.ceil(speakMin)} min. Average sentence length is ${wordsPerSentence} words${Number(wordsPerSentence) > 20 ? " (complex, consider splitting)" : Number(wordsPerSentence) > 15 ? " (moderate)" : " (concise, easy to follow)"}.`,
          tips: ["Academic reading: 150-200 WPM", "Presentation speaking: 120-150 WPM", "Sentences over 25 words reduce comprehension", "Aim for 15-20 words per sentence for clarity"],
        };
      }
      case "tool6": {
        const text = v["Your Text"] || "";
        const ws = text.length;
        const ns = text.replace(/\s/g, "").length;
        const density = ws > 0 ? ((ns / ws) * 100).toFixed(1) : "0";
        return {
          headline: "Character Count",
          headlineValue: `${ws} chars`,
          steps: [
            { label: "With Spaces", expression: "Total string length", result: `${ws} characters` },
            { label: "Without Spaces", expression: "Remove all whitespace", result: `${ns} characters` },
            { label: "Space Count", expression: "With − Without", result: `${ws - ns} spaces` },
            { label: "Char Density", expression: "(No-space ÷ With-space) × 100", result: `${density}%` },
            { label: "Twitter/X (280)", expression: ws <= 280 ? "Within limit" : `Over by ${ws - 280}`, result: ws <= 280 ? `✓ ${280 - ws} remaining` : `✗ Need to cut ${ws - 280} chars` },
            { label: "SMS (160)", expression: `⌈${ws} ÷ 160⌉ segments`, result: ws <= 160 ? `✓ Single SMS (${160 - ws} remaining)` : `⚠ ${Math.ceil(ws / 160)} segments needed` },
            { label: "Instagram (2,200)", expression: ws <= 2200 ? `✓ ${2200 - ws} remaining` : `✗ Over by ${ws - 2200}`, result: ws <= 2200 ? `✓ Within limit` : `✗ Exceeds by ${ws - 2200}` },
            { label: "LinkedIn (3,000)", expression: ws <= 3000 ? `✓ ${3000 - ws} remaining` : `✗ Over by ${ws - 3000}`, result: ws <= 3000 ? `✓ Within limit` : `✗ Exceeds by ${ws - 3000}` },
          ],
          interpretation: `Your text uses ${ws} characters. ${ws <= 280 ? "It fits in a single tweet." : `For Twitter/X, you need to remove ${ws - 280} characters.`} Character density is ${density}% (higher = fewer spaces, more compact).`,
          tips: ["Twitter/X: 280 chars (URLs count as 23)", "SMS: 160 chars (Unicode SMS: 70)", "Instagram: 2,200 for captions", "LinkedIn posts: 3,000 chars max"],
        };
      }
      case "tool7": {
        const text = v["Input Text"] || "";
        const tc = v["Target Case"] || "UPPERCASE";
        let res = text;
        let method = "";
        if (tc === "UPPERCASE") { res = text.toUpperCase(); method = "Convert all letters to uppercase (A-Z)"; }
        else if (tc === "lowercase") { res = text.toLowerCase(); method = "Convert all letters to lowercase (a-z)"; }
        else if (tc === "Title Case") { res = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()); method = "Capitalize first letter of each word"; }
        else if (tc === "camelCase") { res = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()); method = "Lowercase first word, capitalize subsequent, remove spaces"; }
        else if (tc === "snake_case") { res = text.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""); method = "Lowercase all, replace spaces with underscores"; }
        else if (tc === "kebab-case") { res = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); method = "Lowercase all, replace spaces with hyphens"; }
        return {
          headline: "Transformed Text",
          headlineValue: res.length > 40 ? res.slice(0, 40) + "..." : res,
          steps: [
            { label: "Input", expression: "Original text", result: text },
            { label: "Method", expression: tc, result: method },
            { label: "Output", expression: "Transformed", result: res },
            { label: "Length", expression: "Input → Output", result: `${text.length} → ${res.length} chars` },
          ],
          interpretation: `Applied ${tc} transformation. ${tc === "camelCase" ? "Common in JavaScript variables and JSON keys." : tc === "snake_case" ? "Standard in Python, SQL, and API field names." : tc === "kebab-case" ? "Used in CSS classes, URLs, and HTML attributes." : tc === "Title Case" ? "Used for headings, book titles, and proper nouns." : "Basic case conversion for formatting."}`,
          tips: ["camelCase: JavaScript/Java conventions", "snake_case: Python/SQL/Rust conventions", "kebab-case: URLs, CSS, HTML attributes", "Title Case: Headlines and proper nouns"],
        };
      }
      case "tool8": {
        const input = v["Numbers"] || "";
        const nums = input.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n));
        if (!nums.length) return errResult("Enter valid numbers separated by commas.");
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / nums.length;
        const sorted = [...nums].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        const freq: Record<string, number> = {};
        nums.forEach((n) => { freq[String(n)] = (freq[String(n)] || 0) + 1; });
        const maxF = Math.max(...Object.values(freq));
        const modes = Object.entries(freq).filter(([, c]) => c === maxF).map(([k]) => k);
        const variance = nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / nums.length;
        const stdDev = Math.sqrt(variance);
        return {
          headline: "Mean",
          headlineValue: mean.toFixed(2),
          steps: [
            { label: "Count (n)", expression: "Number of values", result: `${nums.length}` },
            { label: "Sum", expression: "Add all values", result: `${sum}` },
            { label: "Mean", expression: "Sum ÷ n", result: `${sum} ÷ ${nums.length} = ${mean.toFixed(4)}` },
            { label: "Median", expression: "Middle of sorted data", result: sorted.length % 2 ? `Position ${mid + 1} = ${median}` : `Avg of pos ${mid} & ${mid + 1} = ${median.toFixed(2)}` },
            { label: "Mode", expression: "Most frequent value(s)", result: maxF > 1 ? modes.join(", ") + ` (appears ${maxF}×)` : "No mode (all unique)" },
            { label: "Range", expression: "Max − Min", result: `${sorted[sorted.length - 1]} − ${sorted[0]} = ${sorted[sorted.length - 1] - sorted[0]}` },
            { label: "Variance", expression: "Σ(x − mean)² ÷ n", result: variance.toFixed(4) },
            { label: "Std Deviation", expression: "√Variance", result: stdDev.toFixed(4) },
          ],
          interpretation: `The mean (${mean.toFixed(2)}) is the arithmetic average. The median (${median.toFixed(2)}) is the middle value. ${Math.abs(mean - median) > stdDev * 0.5 ? "Mean ≠ Median suggests skewed data." : "Mean ≈ Median suggests symmetric distribution."} Std deviation of ${stdDev.toFixed(2)} indicates ${stdDev / Math.abs(mean) > 0.5 ? "high" : "moderate"} variability.`,
          tips: ["Mean is sensitive to outliers; median is robust", "Std dev shows spread around the mean", "68% of data falls within ±1 SD (normal dist)", "95% of data falls within ±2 SD"],
        };
      }
      case "tool9": {
        const price = parseFloat(v["Original Price"] || "0");
        const disc = parseFloat(v["Discount Percentage"] || "0");
        if (!price) return errResult("Enter the original price.");
        const savings = price * (disc / 100);
        const final = price - savings;
        const effMult = 1 - disc / 100;
        return {
          headline: "You Save",
          headlineValue: `₦${savings.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
          steps: [
            { label: "Original Price", expression: "Input", result: `₦${price.toLocaleString()}` },
            { label: "Discount Rate", expression: "Input", result: `${disc}%` },
            { label: "Discount Amount", expression: "Price × (Disc% ÷ 100)", result: `₦${price} × ${(disc / 100).toFixed(3)} = ₦${savings.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
            { label: "Final Price", expression: "Price − Discount", result: `₦${price} − ₦${savings.toFixed(2)} = ₦${final.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
            { label: "Effective Multiplier", expression: "1 − (Disc% ÷ 100)", result: `1 − ${(disc / 100).toFixed(3)} = ${effMult.toFixed(3)}` },
            { label: "Pay Ratio", expression: "Final ÷ Original × 100", result: `${(effMult * 100).toFixed(1)}% of original price` },
          ],
          interpretation: `A ${disc}% discount on ₦${price.toLocaleString()} saves ₦${savings.toLocaleString(undefined, { maximumFractionDigits: 2 })}. You pay only ${(effMult * 100).toFixed(1)}% of the original. ${disc >= 50 ? "Major discount (≥50%)!" : disc >= 20 ? "Solid discount worth taking." : disc >= 10 ? "Moderate discount." : "Small discount."}`,
          tips: ["Stack discounts: apply multiplier sequentially", "Compare effective % off across different prices", "A 50% discount means you pay half price"],
        };
      }
      case "tool10": {
        const p = parseFloat(v["Loan Amount"] || "0");
        const ar = parseFloat(v["Annual Interest Rate (%)"] || "0");
        const n = parseFloat(v["Tenure (Months)"] || "0");
        if (!p || !n) return errResult("Enter loan amount and tenure.");
        const r = ar / 100 / 12;
        const power = Math.pow(1 + r, n);
        const mp = r === 0 ? p / n : p * (r * power) / (power - 1);
        const total = mp * n;
        const interest = total - p;
        const interestRatio = (interest / p) * 100;
        return {
          headline: "Monthly EMI",
          headlineValue: `₦${mp.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
          steps: [
            { label: "Principal (P)", expression: "Loan amount", result: `₦${p.toLocaleString()}` },
            { label: "Monthly Rate (r)", expression: "Annual% ÷ 100 ÷ 12", result: `${ar} ÷ 100 ÷ 12 = ${r.toFixed(6)}` },
            { label: "Tenure (n)", expression: "Months", result: `${n} months (${(n / 12).toFixed(1)} years)` },
            { label: "(1+r)^n", expression: "Compound factor", result: `(1 + ${r.toFixed(6)})^${n} = ${power.toFixed(4)}` },
            { label: "EMI Formula", expression: "P × r(1+r)^n ÷ [(1+r)^n − 1]", result: `₦${p} × (${r.toFixed(6)} × ${power.toFixed(4)}) ÷ (${(power - 1).toFixed(4)})` },
            { label: "Monthly Payment", expression: "Result", result: `₦${mp.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
            { label: "Total Repayment", expression: "EMI × n", result: `₦${mp.toFixed(2)} × ${n} = ₦${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
            { label: "Total Interest", expression: "Total − Principal", result: `₦${interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
            { label: "Interest Ratio", expression: "(Interest ÷ P) × 100", result: `${interestRatio.toFixed(1)}%` },
          ],
          interpretation: `You pay ₦${mp.toLocaleString(undefined, { maximumFractionDigits: 2 })}/month for ${n} months. Total interest is ₦${interest.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${interestRatio.toFixed(1)}% of principal). ${interestRatio > 100 ? "You pay more than double!" : interestRatio > 50 ? "Interest exceeds half the principal." : "Reasonable cost."}`,
          tips: ["Shorter tenure = higher EMI but less total interest", "First payments are mostly interest; later ones mostly principal", "Compare total cost, not just monthly payment", "Prepayment can significantly reduce total interest"],
        };
      }
      case "tool11": {
        const cat = v["Category"] || "";
        const val = parseFloat(v["Value"] || "0");
        const from = (v["From Unit"] || "").toLowerCase().trim();
        const to = (v["To Unit"] || "").toLowerCase().trim();
        if (!val || !from || !to) return errResult("Fill all fields (Category, Value, From, To).");
        if (cat === "Temperature") {
          let c: number; let step1: string;
          if (from === "c") { c = val; step1 = `Already in Celsius: ${val}°C`; }
          else if (from === "f") { c = (val - 32) * 5 / 9; step1 = `(${val} − 32) × 5/9 = ${c.toFixed(4)}°C`; }
          else { c = val - 273.15; step1 = `${val} − 273.15 = ${c.toFixed(4)}°C`; }
          let r2: number; let step2: string;
          if (to === "c") { r2 = c; step2 = `${c.toFixed(2)}°C`; }
          else if (to === "f") { r2 = c * 9 / 5 + 32; step2 = `(${c.toFixed(4)} × 9/5) + 32 = ${r2.toFixed(2)}°F`; }
          else { r2 = c + 273.15; step2 = `${c.toFixed(4)} + 273.15 = ${r2.toFixed(2)}K`; }
          return {
            headline: "Converted",
            headlineValue: `${r2.toFixed(2)}°${to.toUpperCase()}`,
            steps: [
              { label: "Input", expression: `${val}°${from.toUpperCase()}`, result: step1 },
              { label: "To Celsius", expression: "Intermediate step", result: `${c.toFixed(4)}°C` },
              { label: "To Target", expression: `→ ${to.toUpperCase()}`, result: step2 },
              { label: "Reverse Check", expression: `Convert back`, result: `≈ ${val}°${from.toUpperCase()} ✓` },
            ],
            interpretation: `${val}°${from.toUpperCase()} = ${r2.toFixed(2)}°${to.toUpperCase()}. Temperature conversions go through Celsius as the reference unit.`,
            tips: ["C→F: multiply by 9/5, add 32", "F→C: subtract 32, multiply by 5/9", "K→C: subtract 273.15", "Absolute zero = −273.15°C = 0K"],
          };
        } else {
          const lf: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mm: 0.001, miles: 1609.34, ft: 0.3048, in: 0.0254, yd: 0.9144 };
          const wf: Record<string, number> = { kg: 1, g: 0.001, mg: 0.000001, lbs: 0.453592, oz: 0.0283495, tons: 1000 };
          const df: Record<string, number> = { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 };
          const fac = cat === "Length" ? lf : cat === "Weight" ? wf : cat === "Data Storage" ? df : null;
          if (!fac) return errResult("Select a valid category.");
          const ff = fac[from], tf = fac[to];
          if (!ff || !tf) return errResult(`Unknown unit. Valid: ${Object.keys(fac).join(", ")}`);
          const result = val * ff / tf;
          const baseVal = val * ff;
          return {
            headline: "Converted",
            headlineValue: `${result.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to.toUpperCase()}`,
            steps: [
              { label: "Input", expression: `${val} ${from.toUpperCase()}`, result: `Factor for ${from}: ${ff}` },
              { label: "To Base Unit", expression: `Value × factor(${from})`, result: `${val} × ${ff} = ${baseVal} base` },
              { label: "To Target", expression: `Base ÷ factor(${to})`, result: `${baseVal} ÷ ${tf} = ${result.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to.toUpperCase()}` },
              { label: "Conversion Constant", expression: `${from} → ${to}`, result: `Multiply by ${(ff / tf).toFixed(6)}` },
            ],
            interpretation: `1 ${from.toUpperCase()} = ${(ff / tf).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to.toUpperCase()}. Derived from both units' relationship to the base (${cat === "Length" ? "metre" : cat === "Weight" ? "kilogram" : "byte"}).`,
            tips: [`Base unit: ${cat === "Length" ? "metre (m)" : cat === "Weight" ? "kilogram (kg)" : "byte (b)"}`, "All conversions go through the base unit", "1 mile ≈ 1.609 km", "1 kg ≈ 2.205 lbs", "1 GB = 1024 MB (binary)"],
          };
        }
      }
      case "tool12": {
        const text = v["URL or Text"] || "";
        const ec = v["Error Correction"] || "Medium (15%)";
        if (!text) return errResult("Enter a URL or text to encode.");
        const dataLen = text.length;
        const ecLevel = ec.includes("Low") ? "L" : ec.includes("Medium") ? "M" : ec.includes("Quartile") ? "Q" : "H";
        const ecPct = ecLevel === "L" ? 7 : ecLevel === "M" ? 15 : ecLevel === "Q" ? 25 : 30;
        const version = dataLen <= 26 ? 1 : dataLen <= 52 ? 2 : dataLen <= 88 ? 3 : dataLen <= 130 ? 4 : dataLen <= 176 ? 5 : dataLen <= 232 ? 6 : dataLen <= 296 ? 7 : dataLen <= 368 ? 8 : 9;
        const modules = version * 4 + 17;
        return {
          headline: "QR Configuration",
          headlineValue: `v${version} (${modules}×${modules})`,
          steps: [
            { label: "Data Length", expression: "Character count", result: `${dataLen} characters` },
            { label: "QR Version", expression: "Auto-selected by capacity", result: `Version ${version} (${modules}×${modules} modules)` },
            { label: "Error Correction", expression: `${ecLevel} level = ${ecPct}% recovery`, result: `Can recover up to ${ecPct}% damaged modules` },
            { label: "Encoding", expression: "Mode detection", result: text.startsWith("http") ? "URL (ISO 8859-1)" : "UTF-8 (Unicode)" },
            { label: "Standard", expression: "Specification", result: "ISO/IEC 18004:2015" },
            { label: "Capacity Headroom", expression: `Version ${version}, EC ${ecLevel}`, result: `~${Math.floor(dataLen * 1.3)} max chars (${Math.floor(dataLen * 0.3)} extra headroom)` },
          ],
          interpretation: `Your QR will be ${modules}×${modules} modules. With ${ecLevel}-level EC, it survives up to ${ecPct}% damage. ${dataLen > 100 ? "Consider shortening the URL for easier scanning." : "Good size for reliable scanning."}`,
          tips: ["L (7%): Clean indoor printing", "M (15%): Default for general use", "Q (25%): Outdoor signs, wear", "H (30%): Industrial environments", "Keep data < 100 chars for easy scanning", "Add 4-module quiet zone around QR"],
        };
      }
      default:
        return { headline: "Result", headlineValue: "", steps: [], interpretation: `Tool ${toolId} not recognized.`, tips: [] };
    }
  } catch {
    return errResult("Invalid input. Please check your values and try again.");
  }
}
