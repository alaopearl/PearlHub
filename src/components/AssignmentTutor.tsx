import { useRef, useState } from "react";
import { AlertCircle, BrainCircuit, ImagePlus, Loader2, LockKeyhole, Sparkles, X } from "lucide-react";
import { solveAssignment } from "../integrations/supabase/assignmentTutor";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 1_500_000;

async function prepareImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Choose an image smaller than 10 MB.");
  }

  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not process the image.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    if (!blob) throw new Error("This image could not be processed. Try another image.");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the image."));
      reader.onerror = () => reject(new Error("Could not read the image."));
      reader.readAsDataURL(blob);
    });
    if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
      throw new Error("This image is still too large after compression. Try a smaller or lower-resolution image.");
    }
    return dataUrl;
  } finally {
    image.close();
  }
}

export default function AssignmentTutor({ isSignedIn }: { isSignedIn: boolean }) {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<{ name: string; dataUrl: string } | null>(null);
  const [solution, setSolution] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const chooseImage = async (file?: File) => {
    if (!file) return;
    setErrorMessage("");
    try {
      setImage({ name: file.name, dataUrl: await prepareImage(file) });
      setSolution("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load this image.");
    }
  };

  const submitAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      setErrorMessage("Sign in to use the AI Assignment Tutor.");
      return;
    }
    if (!question.trim() && !image) {
      setErrorMessage("Type your assignment question or upload a clear photo.");
      return;
    }
    setBusy(true);
    setErrorMessage("");
    setSolution("");
    try {
      setSolution(await solveAssignment({ question: question.trim(), imageDataUrl: image?.dataUrl }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The tutor could not process this assignment. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">AI Assignment Tutor</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"><Sparkles className="h-3 w-3" /> Step-by-step help</span>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Ask a question or upload a photo of a problem. Get a worked solution with the reasoning behind each step.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)]">
        <div>
          {isSignedIn ? (
            <form onSubmit={submitAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="assignment-question" className="text-sm font-medium text-foreground">Assignment question</label>
                <textarea
                  id="assignment-question"
                  value={question}
                  onChange={(event) => {
                    setQuestion(event.target.value);
                    setSolution("");
                    setErrorMessage("");
                  }}
                  maxLength={12000}
                  rows={5}
                  disabled={busy}
                  placeholder="Type or paste your assignment here. You can also add a photo below."
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
                />
                <p className="text-right text-xs text-muted-foreground">{question.length.toLocaleString()} / 12,000</p>
              </div>

              <div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="Upload assignment image"
                  disabled={busy}
                  onChange={(event) => {
                    void chooseImage(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
                {image ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <img src={image.dataUrl} alt="Assignment upload preview" className="h-14 w-14 rounded-md border border-border object-cover" />
                    <p className="min-w-0 flex-1 truncate text-sm text-foreground">{image.name}</p>
                    <button type="button" onClick={() => { setImage(null); setSolution(""); }} aria-label="Remove uploaded image" disabled={busy} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={busy}
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ImagePlus className="h-4 w-4" /> Upload a photo <span className="font-normal">· JPG, PNG, WebP</span>
                  </button>
                )}
              </div>

              {errorMessage && (
                <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Working through it…</> : <><Sparkles className="h-4 w-4" /> Explain this assignment</>}
              </button>
            </form>
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><LockKeyhole className="h-5 w-5" /></div>
              <h3 className="font-semibold text-foreground">Sign in to use the AI tutor</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Your planner remains available in guest mode. Sign in above to get guided help with assignment text or photos.</p>
            </div>
          )}
        </div>

        <aside className="rounded-xl bg-muted/40 p-4 sm:p-5">
          {solution ? (
            <>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Sparkles className="h-4 w-4 text-primary" /> Worked explanation</div>
              <div className="max-h-[34rem] overflow-auto whitespace-pre-wrap text-sm leading-6 text-foreground">{solution}</div>
            </>
          ) : (
            <>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Learn it, don’t just copy it</h3>
              <ul className="space-y-3 text-sm leading-5 text-muted-foreground">
                <li className="flex gap-2"><span className="mt-0.5 font-semibold text-primary">01</span><span>Understand what the question is asking.</span></li>
                <li className="flex gap-2"><span className="mt-0.5 font-semibold text-primary">02</span><span>Follow the method and reasoning step by step.</span></li>
                <li className="flex gap-2"><span className="mt-0.5 font-semibold text-primary">03</span><span>Check the result and ask follow-up questions.</span></li>
              </ul>
              <div className="mt-5 rounded-lg border border-border/70 bg-background/70 p-3 text-xs leading-5 text-muted-foreground">
                PearlHub sends your question or image to Google Gemini to generate a response, but does not save it. Avoid including personal or sensitive information. AI can make mistakes—verify important answers.
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
