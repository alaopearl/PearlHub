import { supabase } from "./client";

export async function solveAssignment(input: {
  question: string;
  imageDataUrl?: string;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke("solve-assignment", {
    body: input,
  });
  if (error) {
    const response = error.context instanceof Response ? error.context : null;
    if (response?.status === 429) {
      throw new Error("You’ve reached today’s AI tutor limit. Please try again tomorrow.");
    }
    if (response) {
      let body: { error?: unknown } | null = null;
      try {
        body = await response.clone().json() as { error?: unknown };
      } catch {
        body = null;
      }
      if (typeof body?.error === "string" && body.error) throw new Error(body.error);
    }
    throw new Error(error.message || "The AI tutor could not process this assignment.");
  }
  if (!data || typeof data.solution !== "string" || !data.solution.trim()) {
    throw new Error("The AI tutor returned an empty response. Please try again.");
  }
  return data.solution;
}
