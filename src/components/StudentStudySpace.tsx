import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, CheckCircle2, Circle, ClipboardCheck, Cloud, Eye, EyeOff,
  GraduationCap, Loader2, LockKeyhole, Mail, Pause, Play, Plus, RotateCcw, Save,
  Timer, Trash2, UserRound, X,
} from "lucide-react";
import { toast } from "sonner";
import AssignmentTutor from "./AssignmentTutor";
import { supabase } from "../integrations/supabase/client";
import {
  cancelEmailReminder,
  createEmailReminder,
  loadStudyPlan,
  saveStudyPlan,
  type Flashcard,
  type StudyCourse,
  type StudyPlan,
  type StudyTask,
} from "../integrations/supabase/study";
import type { User } from "@supabase/supabase-js";

const STORAGE_KEY = "pearlhub-study-plan";
const EMPTY_PLAN: StudyPlan = {
  tasks: [],
  courses: [],
  semester: "Current semester",
  gradingScale: "5.0",
  flashcards: [],
  notes: "",
  examName: "",
  examDate: "",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const details = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    const parts = [
      typeof details.message === "string" ? details.message : "",
      typeof details.code === "string" ? `(${details.code})` : "",
      typeof details.details === "string" ? details.details : "",
      typeof details.hint === "string" ? `Hint: ${details.hint}` : "",
    ].filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  return "An unexpected error occurred.";
}

function normalizeStudyPlan(value: unknown): StudyPlan {
  if (!value || typeof value !== "object" || Array.isArray(value)) return EMPTY_PLAN;
  const candidate = value as Partial<StudyPlan>;
  return {
    tasks: Array.isArray(candidate.tasks) ? candidate.tasks.filter((item): item is StudyTask =>
      Boolean(item && typeof item.id === "string" && typeof item.title === "string"
        && typeof item.dueDate === "string" && typeof item.completed === "boolean"),
    ) : [],
    courses: Array.isArray(candidate.courses) ? candidate.courses.filter((item): item is StudyCourse =>
      Boolean(item && typeof item.id === "string" && typeof item.name === "string"
        && Number.isFinite(item.credits) && typeof item.grade === "string" && typeof item.semester === "string"),
    ) : [],
    semester: typeof candidate.semester === "string" ? candidate.semester : EMPTY_PLAN.semester,
    gradingScale: candidate.gradingScale === "4.0" ? "4.0" : "5.0",
    flashcards: Array.isArray(candidate.flashcards) ? candidate.flashcards.filter((item): item is Flashcard =>
      Boolean(item && typeof item.id === "string" && typeof item.front === "string"
        && typeof item.back === "string" && typeof item.dueAt === "string" && Number.isFinite(item.intervalDays)),
    ) : [],
    notes: typeof candidate.notes === "string" ? candidate.notes : "",
    examName: typeof candidate.examName === "string" ? candidate.examName : "",
    examDate: typeof candidate.examDate === "string" ? candidate.examDate : "",
  };
}

function readLocalPlan(): StudyPlan {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeStudyPlan(JSON.parse(saved));
    return normalizeStudyPlan({
      ...EMPTY_PLAN,
      tasks: JSON.parse(localStorage.getItem("pearlhub-study-tasks") ?? "[]"),
      notes: localStorage.getItem("pearlhub-study-notes") ?? "",
      examName: localStorage.getItem("pearlhub-exam-name") ?? "",
      examDate: localStorage.getItem("pearlhub-exam-date") ?? "",
    });
  } catch {
    return EMPTY_PLAN;
  }
}

function gradePoints(grade: string, scale: StudyPlan["gradingScale"]): number {
  const points: Record<string, number> = scale === "5.0"
    ? { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }
    : { A: 4, B: 3, C: 2, D: 1, F: 0 };
  return points[grade] ?? 0;
}

export default function StudentStudySpace() {
  const [plan, setPlan] = useState<StudyPlan>(readLocalPlan);
  const [user, setUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [accountBusy, setAccountBusy] = useState(true);
  const [cloudReady, setCloudReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<StudyTask["priority"]>("Medium");
  const [browserReminderAt, setBrowserReminderAt] = useState("");
  const [emailReminderAt, setEmailReminderAt] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
  const [courseGrade, setCourseGrade] = useState("A");
  const [semesterInput, setSemesterInput] = useState(plan.semester);
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"Focus" | "Break">("Focus");
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | "unsupported">(
    "Notification" in window ? Notification.permission : "unsupported",
  );

  const applyPlan = useCallback((nextPlan: StudyPlan) => {
    setPlan(nextPlan);
    setSemesterInput(nextPlan.semester);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPlan));
  }, []);

  const connectAccount = useCallback(async (nextUser: User) => {
    setUser(nextUser);
    setCloudReady(false);
    setSaving(true);
    try {
      const cloudPlan = await loadStudyPlan(nextUser.id);
      if (cloudPlan) {
        applyPlan(normalizeStudyPlan(cloudPlan));
        toast.success("Your Study Space is synced to your account.");
      } else {
        const localPlan = readLocalPlan();
        await saveStudyPlan(nextUser.id, localPlan);
        applyPlan(localPlan);
        toast.success("Your device study data has been synced to your account.");
      }
      setCloudReady(true);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(`Could not load cloud study data: ${message}`);
      setCloudReady(false);
    } finally {
      setSaving(false);
      setAccountBusy(false);
    }
  }, [applyPlan]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        toast.error(`Could not check your account: ${error.message}`);
        setAccountBusy(false);
      } else if (data.session?.user) {
        void connectAccount(data.session.user);
      } else {
        setAccountBusy(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      window.setTimeout(() => {
        if (!active) return;
        if (session?.user) void connectAccount(session.user);
        else {
          setUser(null);
          setCloudReady(false);
          setAccountBusy(false);
        }
      }, 0);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [connectAccount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    if (!user || !cloudReady) return;
    setSaving(true);
    const timeout = window.setTimeout(() => {
      saveStudyPlan(user.id, plan)
        .then(() => setSaving(false))
        .catch((error: unknown) => {
          setSaving(false);
          const message = getErrorMessage(error);
          toast.error(`Could not sync your study plan: ${message}`);
        });
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [plan, user, cloudReady]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          const nextType = sessionType === "Focus" ? "Break" : "Focus";
          const nextMinutes = nextType === "Focus" ? 25 : 5;
          setSessionType(nextType);
          setMinutes(nextMinutes);
          toast.success(nextType === "Focus" ? "Break finished. Ready to focus!" : "Focus session complete. Take a break!");
          return nextMinutes * 60;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, sessionType]);

  useEffect(() => {
    if (browserPermission !== "granted") return;
    const checkReminders = () => {
      const now = Date.now();
      let notifiedIds: string[] = [];
      try {
        const savedIds = JSON.parse(localStorage.getItem("pearlhub-browser-reminders-sent") ?? "[]");
        if (Array.isArray(savedIds)) notifiedIds = savedIds.filter((id): id is string => typeof id === "string");
      } catch {
        notifiedIds = [];
      }
      const notified = new Set(notifiedIds);
      const due = plan.tasks.filter((task) =>
        !task.completed && task.browserReminderAt && Date.parse(task.browserReminderAt) <= now && !notified.has(task.id),
      );
      for (const task of due) {
        new Notification("PearlHub study reminder", { body: task.title });
        notified.add(task.id);
      }
      if (due.length) localStorage.setItem("pearlhub-browser-reminders-sent", JSON.stringify([...notified]));
    };
    checkReminders();
    const timer = window.setInterval(checkReminders, 15000);
    return () => window.clearInterval(timer);
  }, [browserPermission, plan.tasks]);

  const dueCards = useMemo(
    () => plan.flashcards.filter((card) => Date.parse(card.dueAt) <= Date.now()),
    [plan.flashcards],
  );
  const activeCard = dueCards.find((card) => card.id === activeCardId) ?? dueCards[0];
  const currentCourses = plan.courses.filter((course) => course.semester === plan.semester);
  const semesterGpa = useMemo(() => {
    const units = currentCourses.reduce((sum, course) => sum + course.credits, 0);
    const quality = currentCourses.reduce((sum, course) => sum + gradePoints(course.grade, plan.gradingScale) * course.credits, 0);
    return units ? (quality / units).toFixed(2) : "—";
  }, [currentCourses, plan.gradingScale]);
  const cumulativeGpa = useMemo(() => {
    const units = plan.courses.reduce((sum, course) => sum + course.credits, 0);
    const quality = plan.courses.reduce((sum, course) => sum + gradePoints(course.grade, plan.gradingScale) * course.credits, 0);
    return units ? (quality / units).toFixed(2) : "—";
  }, [plan.courses, plan.gradingScale]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
    if (error) {
      toast.error(`Sign-in failed: ${error.message}`);
      setAccountBusy(false);
    }
  };

  const signUp = async () => {
    if (!authEmail.trim() || authPassword.length < 8) {
      toast.error("Enter an email and a password with at least 8 characters.");
      return;
    }
    setAccountBusy(true);
    const { data, error } = await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword });
    if (error) {
      toast.error(`Account creation failed: ${error.message}`);
      setAccountBusy(false);
    } else if (!data.session) {
      toast.success("Check your email to confirm your account, then sign in to sync.");
      setAccountBusy(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(`Could not sign out: ${error.message}`);
    else toast.success("Signed out. Your local copy remains on this device.");
  };

  const addTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim()) {
      toast.error("Enter an assignment or study task.");
      return;
    }
    if (emailReminderAt && !user?.email) {
      toast.error("Sign in with email to schedule email reminders.");
      return;
    }
    if (emailReminderAt) {
      const reminderTime = new Date(emailReminderAt).getTime();
      if (!Number.isFinite(reminderTime) || reminderTime <= Date.now() || reminderTime > Date.now() + 365 * 86400000) {
        toast.error("Choose an email reminder time within the next year.");
        return;
      }
    }
    const task: StudyTask = {
      id: crypto.randomUUID(),
      title: taskTitle.trim(),
      dueDate: taskDate,
      priority: taskPriority,
      completed: false,
      browserReminderAt: browserReminderAt || undefined,
    };
    if (emailReminderAt && user?.email) {
      try {
        task.emailReminderId = await createEmailReminder({
          userId: user.id,
          email: user.email,
          title: task.title,
          reminderAt: new Date(emailReminderAt).toISOString(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(`Could not schedule email reminder: ${message}`);
        return;
      }
    }
    setPlan((current) => ({ ...current, tasks: [task, ...current.tasks] }));
    setTaskTitle("");
    setTaskDate("");
    setBrowserReminderAt("");
    setEmailReminderAt("");
    toast.success("Study task added.");
  };

  const removeTask = async (task: StudyTask) => {
    if (task.emailReminderId) {
      try {
        await cancelEmailReminder(task.emailReminderId);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(`Task removed locally, but its email reminder could not be canceled: ${message}`);
      }
    }
    setPlan((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== task.id) }));
  };

  const toggleTask = async (task: StudyTask) => {
    if (!task.completed && task.emailReminderId) {
      try {
        await cancelEmailReminder(task.emailReminderId);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(`Could not cancel the email reminder: ${message}`);
        return;
      }
    }
    setPlan((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === task.id
          ? { ...item, completed: !item.completed, emailReminderId: !item.completed ? undefined : item.emailReminderId }
          : item,
      ),
    }));
  };

  const addCourse = (event: React.FormEvent) => {
    event.preventDefault();
    const credits = Number(courseCredits);
    if (!courseName.trim() || !Number.isFinite(credits) || credits <= 0) {
      toast.error("Enter a course name and positive credit units.");
      return;
    }
    const course: StudyCourse = {
      id: crypto.randomUUID(),
      name: courseName.trim(),
      credits,
      grade: courseGrade,
      semester: plan.semester,
    };
    setPlan((current) => ({ ...current, courses: [...current.courses, course] }));
    setCourseName("");
    setCourseCredits("");
  };

  const addFlashcard = (event: React.FormEvent) => {
    event.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) {
      toast.error("Add both a question and an answer.");
      return;
    }
    const card: Flashcard = {
      id: crypto.randomUUID(),
      front: cardFront.trim(),
      back: cardBack.trim(),
      dueAt: new Date(0).toISOString(),
      intervalDays: 0,
    };
    setPlan((current) => ({ ...current, flashcards: [card, ...current.flashcards] }));
    setCardFront("");
    setCardBack("");
  };

  const reviewCard = (remembered: boolean) => {
    if (!activeCard) return;
    const days = remembered ? Math.min(activeCard.intervalDays ? activeCard.intervalDays * 2 : 1, 30) : 1;
    const dueAt = new Date(Date.now() + days * 86400000).toISOString();
    setPlan((current) => ({
      ...current,
      flashcards: current.flashcards.map((card) =>
        card.id === activeCard.id ? { ...card, dueAt, intervalDays: days } : card,
      ),
    }));
    setActiveCardId(null);
    setShowAnswer(false);
  };

  const enableBrowserReminders = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setBrowserPermission(permission);
    if (permission === "granted") toast.success("Browser reminders are enabled while PearlHub is open.");
    else toast.error("Notification permission was not granted.");
  };

  const examDays = plan.examDate
    ? Math.ceil((new Date(`${plan.examDate}T23:59:59`).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="h-5 w-5" /></div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Student Study Space</h1>
        </div>
        <p className="max-w-2xl text-muted-foreground">Plan assignments, track grades and exams, review flashcards, and stay focused. Guest data is saved on this device.</p>
      </div>

      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {user ? (
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Cloud className="h-5 w-5" /></div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Study Space connected</p>
                <p className="truncate text-sm text-muted-foreground">{user.email} · {saving ? "Syncing your study data…" : cloudReady ? "Synced across your devices" : "Connecting to your account…"}</p>
              </div>
            </div>
            <button onClick={signOut} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Sign out</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-[0.85fr_1.15fr]">
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground sm:p-8">
              <div className="pointer-events-none absolute -right-14 -top-20 -z-10 h-56 w-56 rounded-full border border-current/10" />
              <div className="pointer-events-none absolute -right-5 -top-11 -z-10 h-40 w-40 rounded-full border border-current/10" />
              <div className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-background/15 ring-1 ring-inset ring-background/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">Your learning, in sync</p>
              <h2 className="max-w-sm text-2xl font-bold leading-tight sm:text-3xl">Make every study session count.</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-primary-foreground/75">Keep your assignments, grades, notes, and flashcards ready wherever you study.</p>
              <div className="mt-7 flex items-center gap-2 text-sm text-primary-foreground/85">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Your local study data stays on this device</span>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <div className="mb-6">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" /> Optional account
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {authMode === "signin" ? "Welcome back" : "Create your account"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {authMode === "signin" ? "Sign in to sync your Study Space across devices." : "Get started with a free account to sync your study data."}
                </p>
              </div>

              <div className="mb-5 grid grid-cols-2 rounded-lg bg-muted/70 p-1" role="group" aria-label="Account action">
                <button
                  type="button"
                  aria-pressed={authMode === "signin"}
                  onClick={() => setAuthMode("signin")}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${authMode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  aria-pressed={authMode === "signup"}
                  onClick={() => setAuthMode("signup")}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${authMode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Create account
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  if (authMode === "signin") void signIn(event);
                  else {
                    event.preventDefault();
                    void signUp();
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label htmlFor="study-account-email" className="text-sm font-medium text-foreground">Email address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="study-account-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={authEmail}
                      onChange={(event) => setAuthEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="study-account-password" className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="study-account-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                      minLength={authMode === "signup" ? 8 : undefined}
                      required
                      value={authPassword}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      placeholder={authMode === "signup" ? "At least 8 characters" : "Enter your password"}
                      className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {authMode === "signup" && <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>}
                </div>
                <button
                  disabled={accountBusy}
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {accountBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>{authMode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
              <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                {authMode === "signin" ? "New to PearlHub? Choose Create account above." : "Already have an account? Choose Sign in above."}
                {" "}Guest mode remains available either way.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="text-lg font-semibold text-foreground">Assignment Planner</h2><p className="text-sm text-muted-foreground">{plan.tasks.filter((task) => !task.completed).length} active tasks</p></div>
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <form onSubmit={addTask} className="mb-5 grid gap-3 sm:grid-cols-[1fr_140px_110px_auto]">
            <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Assignment or study task" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <input type="date" value={taskDate} onChange={(event) => setTaskDate(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as StudyTask["priority"])} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"><option>High</option><option>Medium</option><option>Low</option></select>
            <button type="submit" className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
            <label className="text-xs text-muted-foreground">Browser reminder (works while this page is open)<input type="datetime-local" value={browserReminderAt} onChange={(event) => setBrowserReminderAt(event.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
            <label className="text-xs text-muted-foreground sm:col-span-2">Email reminder (sign in required)<input type="datetime-local" value={emailReminderAt} onChange={(event) => setEmailReminderAt(event.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
            <button type="button" onClick={() => void enableBrowserReminders()} className="inline-flex items-center justify-center gap-2 self-end rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><Mail className="h-4 w-4" />{browserPermission === "granted" ? "Notifications on" : "Enable notifications"}</button>
          </form>
          <div className="space-y-2">
            {plan.tasks.map((task) => (
              <div key={task.id} className={`flex items-center gap-3 rounded-lg border border-border p-3 ${task.completed ? "opacity-60" : ""}`}>
                <button aria-label={task.completed ? "Mark task active" : "Mark task complete"} onClick={() => void toggleTask(task)}>
                  {task.completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div className="min-w-0 flex-1"><p className={`text-sm font-medium text-foreground ${task.completed ? "line-through" : ""}`}>{task.title}</p><p className="text-xs text-muted-foreground">{task.dueDate ? `Due ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString()}` : "No due date"} · {task.priority} priority{task.emailReminderId ? " · email reminder scheduled" : ""}</p></div>
                <button aria-label="Delete task" onClick={() => void removeTask(task)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {plan.tasks.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">No assignments yet. Add your first task above.</div>}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-primary"><Timer className="h-4 w-4" /> {sessionType} Timer</div>
            <div className="mb-4 text-5xl font-bold tabular-nums text-foreground">{String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}</div>
            <div className="flex justify-center gap-2">
              <button onClick={() => setRunning((current) => !current)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{running ? "Pause" : "Start"}</button>
              <button onClick={() => { setRunning(false); setSecondsLeft(minutes * 60); }} aria-label="Reset timer" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /><h2 className="font-semibold text-foreground">Semester & GPA Planner</h2></div>
            <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
              <input value={semesterInput} onChange={(event) => {
                const semester = event.target.value;
                setSemesterInput(semester);
                setPlan((current) => ({ ...current, semester: semester.trim() || "Current semester" }));
              }} placeholder="Semester name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <select value={plan.gradingScale} onChange={(event) => setPlan((current) => ({ ...current, gradingScale: event.target.value as StudyPlan["gradingScale"] }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="5.0">5.0 scale</option><option value="4.0">4.0 scale</option></select>
              <div className="self-center text-xs text-muted-foreground">Term {semesterGpa} · CGPA {cumulativeGpa}</div>
            </div>
            <form onSubmit={addCourse} className="mb-3 grid gap-2 sm:grid-cols-[1fr_80px_80px_auto]">
              <input value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="Course title/code" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input type="number" min="0.5" step="0.5" value={courseCredits} onChange={(event) => setCourseCredits(event.target.value)} placeholder="Units" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <select value={courseGrade} onChange={(event) => setCourseGrade(event.target.value)} className="rounded-lg border border-border bg-background px-2 py-2 text-sm"><option>A</option><option>B</option><option>C</option><option>D</option>{plan.gradingScale === "5.0" && <option>E</option>}<option>F</option></select>
              <button type="submit" aria-label="Add course" className="rounded-lg bg-primary px-3 text-primary-foreground"><Plus className="h-4 w-4" /></button>
            </form>
            <div className="space-y-2">
              {currentCourses.map((course) => <div key={course.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"><span>{course.name} · {course.credits} units</span><span className="flex items-center gap-2 font-medium">{course.grade}<button aria-label={`Remove ${course.name}`} onClick={() => setPlan((current) => ({ ...current, courses: current.courses.filter((item) => item.id !== course.id) }))}><X className="h-4 w-4 text-muted-foreground" /></button></span></div>)}
              {currentCourses.length === 0 && <p className="py-3 text-center text-xs text-muted-foreground">Add courses to calculate your term GPA and cumulative GPA.</p>}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h2 className="font-semibold text-foreground">Exam Countdown</h2></div>
            <input value={plan.examName} onChange={(event) => setPlan((current) => ({ ...current, examName: event.target.value }))} placeholder="Exam name" className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <input type="date" value={plan.examDate} onChange={(event) => setPlan((current) => ({ ...current, examDate: event.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            {plan.examName && plan.examDate && examDays !== null && <div className="mt-4 rounded-lg bg-primary/5 p-4 text-center"><p className="text-sm text-muted-foreground">{plan.examName}</p><p className="text-2xl font-bold text-primary">{examDays > 0 ? `${examDays} days left` : examDays === 0 ? "Today" : "Date passed"}</p></div>}
          </section>
        </div>
      </div>

      <AssignmentTutor isSignedIn={Boolean(user)} />

      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h2 className="font-semibold text-foreground">Flashcards & Quick Quiz</h2></div><span className="text-xs text-muted-foreground">{dueCards.length} cards due</span></div>
        <form onSubmit={addFlashcard} className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={cardFront} onChange={(event) => setCardFront(event.target.value)} placeholder="Question or term" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          <input value={cardBack} onChange={(event) => setCardBack(event.target.value)} placeholder="Answer or definition" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add card</button>
        </form>
        {activeCard ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">Question</p><p className="mb-4 text-lg font-semibold text-foreground">{activeCard.front}</p>
            {showAnswer ? <><p className="mb-4 rounded-lg bg-background p-3 text-sm text-foreground">{activeCard.back}</p><div className="flex gap-2"><button onClick={() => reviewCard(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Review tomorrow</button><button onClick={() => reviewCard(true)} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">I knew it</button></div></> : <button onClick={() => { setActiveCardId(activeCard.id); setShowAnswer(true); }} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Show answer</button>}
          </div>
        ) : <p className="rounded-lg bg-muted/40 p-5 text-center text-sm text-muted-foreground">{plan.flashcards.length ? "You’re all caught up. Cards return for review on their scheduled day." : "Create flashcards for active recall. Review spacing increases as you remember them."}</p>}
        {plan.flashcards.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{plan.flashcards.map((card) => <button key={card.id} onClick={() => { setActiveCardId(card.id); setShowAnswer(false); }} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted">{card.front.slice(0, 30)}{card.front.length > 30 ? "…" : ""} <span aria-label="delete" onClick={(event) => { event.stopPropagation(); setPlan((current) => ({ ...current, flashcards: current.flashcards.filter((item) => item.id !== card.id) })); }}>×</span></button>)}</div>}
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-3 flex items-center gap-2"><Save className="h-5 w-5 text-primary" /><h2 className="font-semibold text-foreground">Quick Study Notes</h2></div>
        <textarea value={plan.notes} onChange={(event) => setPlan((current) => ({ ...current, notes: event.target.value }))} rows={8} placeholder="Capture formulas, lecture notes, revision ideas, or questions..." className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed" />
        <p className="mt-2 text-xs text-muted-foreground">{user ? (saving ? "Saving to your account…" : "Synced to your account.") : "Notes are saved automatically on this device."}</p>
      </section>
    </div>
  );
}
