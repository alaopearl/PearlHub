import { supabase } from "./client";

export interface StudyTask {
  id: string;
  title: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  browserReminderAt?: string;
  emailReminderId?: string;
}

export interface StudyCourse {
  id: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  dueAt: string;
  intervalDays: number;
}

export interface StudyPlan {
  tasks: StudyTask[];
  courses: StudyCourse[];
  semester: string;
  gradingScale: "4.0" | "5.0";
  flashcards: Flashcard[];
  notes: string;
  examName: string;
  examDate: string;
}

export async function loadStudyPlan(userId: string): Promise<StudyPlan | null> {
  const { data, error } = await supabase
    .from("student_study_plans")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.data as StudyPlan | null;
}

export async function saveStudyPlan(userId: string, plan: StudyPlan): Promise<void> {
  const { error } = await supabase.from("student_study_plans").upsert(
    { user_id: userId, data: plan, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function createEmailReminder(input: {
  userId: string;
  email: string;
  title: string;
  reminderAt: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("study_reminders")
    .insert({
      user_id: input.userId,
      email: input.email,
      title: input.title,
      reminder_at: input.reminderAt,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function cancelEmailReminder(id: string): Promise<void> {
  const { error } = await supabase.from("study_reminders").delete().eq("id", id);
  if (error) throw error;
}
