import type { Article, Author, ToolItem } from "./types";

export const AUTHORS: Author[] = [
  { id: "a1", name: "Chidi Okonkwo", title: "Senior Tech Editor", avatar: "CO", bio: "Chidi covers AI, programming, and software development with 8 years of experience building products across Africa and Europe.", },
  { id: "a2", name: "Amara Bello", title: "Education Lead", avatar: "AB", bio: "Amara specializes in Nigerian exam preparation, university admissions, and scholarship guidance for students across West Africa.", },
  { id: "a3", name: "David Mensah", title: "Software Engineer", avatar: "DM", bio: "David writes practical tutorials on React, Python, and modern web development stacks used by African startups.", },
  { id: "a4", name: "Fatima Yusuf", title: "Academic Advisor", avatar: "FY", bio: "Fatima helps students navigate GPA calculations, CGPA grading scales, and scholarship applications for local and international universities.", },
  { id: "a5", name: "Emeka Nwosu", title: "Gadget Reviewer", avatar: "EN", bio: "Emeka reviews phones, laptops, and accessories available in the Nigerian market with honest, data-driven assessments.", },
  { id: "a6", name: "Sarah Adeyemi", title: "Content Strategist", avatar: "SA", bio: "Sarah curates study resources, productivity guides, and career content for PearlHub's education vertical.", },
];

export const TECH_SUBCATEGORIES = [
  "Artificial Intelligence", "AI Tools & Tutorials", "Programming & Software Development",
  "HTML/CSS/JavaScript", "React & Next.js", "Python Programming", "Software Reviews", "Gadgets/Tech News",
];

export const EDU_SUBCATEGORIES = [
  "Study Resources", "Examination Preparation", "University Guides", "GPA & CGPA Guides",
  "Scholarships", "Career Opportunities", "Online Learning", "Student Productivity",
];

export const TOOL_CATEGORIES = ["Calculators", "Academic", "Text & Writing", "Utilities"];

export const ARTICLES: Article[] = [
  {
    id: "t1", title: "Top 10 AI Tools Every Student in Nigeria Should Use in 2025",
    slug: "top-ai-tools-nigeria-2025", excerpt: "From research assistants to writing tools, these AI platforms are transforming how Nigerian students learn, write, and build projects.",
    content: [
      { type: "paragraph", content: "Artificial intelligence is no longer a luxury reserved for big tech companies. Across Nigeria, students are using AI-powered tools to write better essays, debug code faster, and research more efficiently than ever before." },
      { type: "heading", content: "1. Research & Summarization Tools" },
      { type: "paragraph", content: "Tools like Perplexity AI and Elicit help students find academic sources and summarize complex papers in seconds. For Nigerian university students working on final year projects, these tools save hours of manual literature review." },
      { type: "callout", content: "Pro tip: Use Elicit to find peer-reviewed papers on any topic. It searches over 100 million academic papers and extracts key findings automatically." },
      { type: "heading", content: "2. Writing & Editing Assistants" },
      { type: "paragraph", content: "Grammarly, QuillBot, and Jasper AI help students polish their academic writing. QuillBot's paraphrasing tool is especially useful for rewording research notes without losing meaning." },
      { type: "heading", content: "3. Coding & Development Helpers" },
      { type: "paragraph", content: "GitHub Copilot and Cursor AI are game-changers for programming students. They autocomplete code, explain errors, and even generate entire functions from natural language descriptions." },
      { type: "list", content: "Most popular AI tools among Nigerian students:", items: ["ChatGPT for brainstorming and explanations", "Perplexity for academic research", "QuillBot for paraphrasing essays", "GitHub Copilot for coding assignments", "Canva AI for presentation design"] },
      { type: "paragraph", content: "The key is using these tools as learning aids, not shortcuts. Students who understand how to prompt effectively get far better results than those who simply copy outputs." },
    ],
    category: "technology", subcategory: "Artificial Intelligence", authorId: "a1", date: "2025-01-15", readTime: 8, tags: ["AI", "Tools", "Students", "Nigeria"], featured: true, gradient: "from-indigo-600 to-purple-600",
  },
  {
    id: "t2", title: "Python for Beginners: A Complete Roadmap for African Developers",
    slug: "python-beginners-roadmap-africa", excerpt: "A structured learning path from zero to job-ready Python developer, tailored for the African tech ecosystem and remote work market.",
    content: [
      { type: "paragraph", content: "Python remains the most beginner-friendly programming language with the widest range of career paths. From data science to web development, Python opens doors across the African tech industry." },
      { type: "heading", content: "Phase 1: Foundations (Weeks 1-4)" },
      { type: "paragraph", content: "Start with variables, data types, loops, and functions. Practice on platforms like HackerRank and LeetCode. Build small projects: a calculator, a to-do list, a number guessing game." },
      { type: "code", content: `def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to Python."

print(greet("Lagos"))` },
      { type: "heading", content: "Phase 2: Intermediate (Weeks 5-10)" },
      { type: "paragraph", content: "Learn object-oriented programming, file handling, error handling, and working with APIs. Build a weather app using a REST API or a web scraper for Nigerian news sites." },
      { type: "heading", content: "Phase 3: Specialization (Weeks 11-20)" },
      { type: "list", content: "Choose your path:", items: ["Web Development: Django or Flask for building APIs", "Data Science: Pandas, NumPy, and Matplotlib", "Machine Learning: scikit-learn and TensorFlow", "Automation: Selenium, BeautifulSoup, and cron jobs"] },
      { type: "paragraph", content: "The African tech market values developers who can build real products. Focus on portfolio projects that solve local problems: fintech tools, agricultural data apps, or education platforms." },
    ],
    category: "technology", subcategory: "Python Programming", authorId: "a3", date: "2025-01-10", readTime: 12, tags: ["Python", "Programming", "Roadmap", "Beginners"], featured: true, gradient: "from-blue-600 to-cyan-500",
  },
  {
    id: "t3", title: "React vs Next.js: Which Framework Should You Learn First?",
    slug: "react-vs-nextjs-2025", excerpt: "A practical comparison of React and Next.js for developers deciding their first modern JavaScript framework.",
    content: [
      { type: "paragraph", content: "This is one of the most common questions from developers in our community. Both React and Next.js are excellent, but they serve different purposes and learning them in the right order matters." },
      { type: "heading", content: "Understanding the Relationship" },
      { type: "paragraph", content: "Next.js is built on top of React. Learning React first gives you a stronger foundation. Next.js adds routing, server-side rendering, and API routes on top of React's component model." },
      { type: "heading", content: "When to Choose React" },
      { type: "list", content: ["Building single-page applications (SPAs)", "Working with existing backend APIs", "Learning component-based UI thinking", "Building mobile apps with React Native"] },
      { type: "heading", content: "When to Choose Next.js" },
      { type: "list", content: ["Building SEO-friendly websites", "Creating full-stack applications", "Need server-side rendering or static generation", "Building content-heavy sites like blogs or e-commerce"] },
      { type: "callout", content: "Our recommendation: Spend 4-6 weeks learning React fundamentals, then transition to Next.js for real projects. This gives you the best of both worlds." },
    ],
    category: "technology", subcategory: "React & Next.js", authorId: "a3", date: "2025-01-08", readTime: 7, tags: ["React", "Next.js", "JavaScript", "Web Dev"], featured: false, gradient: "from-violet-600 to-fuchsia-500",
  },
  {
    id: "t4", title: "Best Budget Laptops Under 300,000 Naira for Programming in 2025",
    slug: "budget-laptops-under-300k-nigeria", excerpt: "Real-world tested laptops that can handle coding, virtual machines, and development tools without breaking the bank.",
    content: [
      { type: "paragraph", content: "Finding a reliable programming laptop in Nigeria under 300,000 Naira is challenging but possible. We tested 12 models over three months running VS Code, Docker, and browser-heavy development workflows." },
      { type: "heading", content: "Top Pick: Lenovo ThinkPad E14 Gen 5" },
      { type: "paragraph", content: "With an AMD Ryzen 5 7530U, 16GB RAM, and 512GB SSD, this machine handles full-stack development comfortably. The keyboard is exceptional for long coding sessions, and the build quality is military-grade." },
      { type: "heading", content: "Runner Up: HP Pavilion 15 (2024)" },
      { type: "paragraph", content: "Intel Core i5-1335U with 12GB RAM. Slightly less powerful than the ThinkPad but offers a better display and more ports. Great for students who also need a laptop for presentations and media." },
      { type: "list", content: "Key specs to look for:", items: ["Minimum 8GB RAM (16GB strongly recommended)", "SSD storage (avoid HDDs entirely)", "Multi-core processor (Ryzen 5 or Intel i5 minimum)", "Full HD display for comfortable coding", "Good keyboard for long typing sessions"] },
    ],
    category: "technology", subcategory: "Gadgets/Tech News", authorId: "a5", date: "2025-01-05", readTime: 6, tags: ["Laptops", "Budget", "Programming", "Nigeria"], featured: true, gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "t5", title: "How to Build Your First Web App with HTML, CSS, and JavaScript",
    slug: "first-web-app-html-css-js", excerpt: "A step-by-step tutorial to build a fully functional task manager web application from scratch using vanilla web technologies.",
    content: [
      { type: "paragraph", content: "Every web developer starts with HTML, CSS, and JavaScript. In this tutorial, we will build a task manager application that lets users add, complete, and delete tasks with local storage persistence." },
      { type: "heading", content: "Step 1: Setting Up the Project" },
      { type: "code", content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Task Manager</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  <script src="app.js"></script>
</body>
</html>` },
      { type: "heading", content: "Step 2: Styling with CSS" },
      { type: "paragraph", content: "Use CSS Grid and Flexbox for layout. Define custom properties for colors so your app supports dark mode easily. Keep your stylesheet organized with sections for layout, components, and utilities." },
      { type: "heading", content: "Step 3: Adding Interactivity with JavaScript" },
      { type: "paragraph", content: "Use DOM manipulation to handle user events. Store tasks in localStorage so data persists between sessions. Keep your code modular with separate functions for rendering, event handling, and data management." },
      { type: "callout", content: "Challenge: After completing this tutorial, try adding features like task categories, due dates, or drag-and-drop reordering to deepen your skills." },
    ],
    category: "technology", subcategory: "HTML/CSS/JavaScript", authorId: "a3", date: "2025-01-03", readTime: 15, tags: ["HTML", "CSS", "JavaScript", "Tutorial"], featured: false, gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "t6", title: "Notion vs Obsidian: Best Note-Taking App for Students",
    slug: "notion-vs-obsidian-students", excerpt: "An in-depth comparison of the two most popular note-taking tools, evaluated for academic use, offline access, and long-term knowledge management.",
    content: [
      { type: "paragraph", content: "Choosing the right note-taking app can dramatically improve your study efficiency. Notion and Obsidian represent two different philosophies: cloud-first collaboration versus local-first knowledge graphs." },
      { type: "heading", content: "Notion: The All-in-One Workspace" },
      { type: "paragraph", content: "Notion excels at structured notes, databases, and team collaboration. Its template gallery includes ready-made study planners, lecture note layouts, and assignment trackers." },
      { type: "heading", content: "Obsidian: The Knowledge Graph" },
      { type: "paragraph", content: "Obsidian stores notes as plain Markdown files on your device. The linking system creates a visual knowledge graph that reveals connections between topics you never expected." },
      { type: "list", content: "Quick verdict:", items: ["Choose Notion if you need collaboration, databases, and templates", "Choose Obsidian if you want offline access, speed, and linked thinking", "Students with unreliable internet should prefer Obsidian", "Group project teams benefit more from Notion"] },
    ],
    category: "technology", subcategory: "Software Reviews", authorId: "a1", date: "2024-12-28", readTime: 9, tags: ["Notion", "Obsidian", "Productivity", "Students"], featured: false, gradient: "from-slate-600 to-zinc-700",
  },
  {
    id: "t7", title: "AI Tools & Tutorials: Automating Repetitive Tasks with Python Scripts",
    slug: "ai-automation-python-scripts", excerpt: "Learn how to combine AI APIs with Python automation to eliminate hours of repetitive work, from data entry to report generation.",
    content: [
      { type: "paragraph", content: "Combining AI APIs with Python automation creates powerful workflows that save hours every week. This guide walks through three practical automation projects using free AI tools." },
      { type: "heading", content: "Project 1: Auto-Generate Meeting Summaries" },
      { type: "paragraph", content: "Use the Whisper API to transcribe meeting recordings, then pass the text to a summarization model. Output clean meeting notes saved directly to your project management tool." },
      { type: "heading", content: "Project 2: Smart Email Categorizer" },
      { type: "paragraph", content: "Build a script that reads your inbox, classifies emails by urgency and topic using a classification model, and creates labeled folders automatically." },
      { type: "code", content: `import openai

response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": f"Classify this email: {email_body}"}]
)` },
      { type: "paragraph", content: "These projects use free-tier API access and take under 50 lines of code each. Start with one, master it, then expand to more complex workflows." },
    ],
    category: "technology", subcategory: "AI Tools & Tutorials", authorId: "a1", date: "2024-12-20", readTime: 11, tags: ["AI", "Python", "Automation", "Tutorial"], featured: false, gradient: "from-rose-500 to-pink-600",
  },
  {
    id: "e1", title: "How to Calculate Your CGPA on the 5.0 Scale (Nigerian Universities)",
    slug: "cgpa-5-point-scale-guide", excerpt: "A complete walkthrough of calculating your Cumulative Grade Point Average on the Nigerian 5.0 grading system, with worked examples for every faculty.",
    content: [
      { type: "paragraph", content: "Understanding how to calculate your CGPA is essential for every Nigerian university student. The 5.0 scale is used by most federal and state universities, and the calculation follows a consistent formula." },
      { type: "heading", content: "The Grading System" },
      { type: "list", content: ["A = 5 points (70-100%)", "B = 4 points (60-69%)", "C = 3 points (50-59%)", "D = 2 points (45-49%)", "E = 1 point (40-44%)", "F = 0 points (Below 40%)"] },
      { type: "heading", content: "Step-by-Step Calculation" },
      { type: "paragraph", content: "Multiply each course grade point by its unit value to get quality points. Sum all quality points and divide by total units taken. The result is your GPA for that semester." },
      { type: "code", content: `GPA = Sum of (Grade Point x Unit) / Total Units

Example:
MTH101: A(5) x 3 units = 15
PHY101: B(4) x 3 units = 12
CHM101: A(5) x 2 units = 10
GST101: B(4) x 2 units = 8

GPA = (15+12+10+8) / (3+3+2+2) = 45/10 = 4.5` },
      { type: "callout", content: "CGPA is calculated the same way but across ALL semesters. Add up total quality points from every semester and divide by total units from every semester." },
      { type: "paragraph", content: "Most Nigerian universities classify degrees as: First Class (4.50-5.00), Second Class Upper (3.50-4.49), Second Class Lower (2.40-3.49), Third Class (1.50-2.39), Pass (1.00-1.49)." },
    ],
    category: "education", subcategory: "GPA & CGPA Guides", authorId: "a4", date: "2025-01-14", readTime: 10, tags: ["CGPA", "5.0 Scale", "Nigerian Universities", "Grading"], featured: true, gradient: "from-blue-700 to-indigo-600",
  },
  {
    id: "e2", title: "JAMB 2025: Complete Preparation Guide with Past Questions Strategy",
    slug: "jamb-2025-preparation-guide", excerpt: "A proven study plan for JAMB UTME preparation covering all four subjects, time management, and how to use past questions effectively.",
    content: [
      { type: "paragraph", content: "JAMB UTME remains the gateway to Nigerian university admission. With over 2 million candidates annually, strategic preparation separates successful candidates from the rest." },
      { type: "heading", content: "The 8-Week Study Plan" },
      { type: "list", content: ["Weeks 1-2: Cover all topics in your four subjects using recommended textbooks", "Weeks 3-4: Solve past questions from 2015-2020, one subject per day", "Weeks 5-6: Focus on weak areas identified from past question analysis", "Weeks 7-8: Full mock CBT exams under timed conditions, daily"] },
      { type: "heading", content: "Subject-Specific Tips" },
      { type: "paragraph", content: "Use Mathematics: Practice speed with shortcuts. English: Master comprehension and register/tone questions. Sciences: Focus on definitions and diagrams. Social Sciences: Build a timeline of key events." },
      { type: "callout", content: "Critical insight: JAMB repeats concepts, not exact questions. Understanding the underlying principle behind each past question is far more valuable than memorizing answers." },
      { type: "paragraph", content: "On exam day, arrive 2 hours early. Read each question twice before answering. Flag uncertain questions and return to them. Never leave a question unanswered, there is no penalty for wrong answers." },
    ],
    category: "education", subcategory: "Examination Preparation", authorId: "a2", date: "2025-01-12", readTime: 14, tags: ["JAMB", "UTME", "Exam Prep", "Nigeria"], featured: true, gradient: "from-green-600 to-emerald-500",
  },
  {
    id: "e3", title: "WAEC Mathematics: 20 Must-Know Formulas and Problem-Solving Techniques",
    slug: "waec-mathematics-formulas", excerpt: "The essential formulas every WAEC candidate needs, organized by topic with worked examples showing exactly how examiners expect solutions to be presented.",
    content: [
      { type: "paragraph", content: "WAEC Mathematics rewards both correct answers and proper working. This guide covers the 20 formulas that appear most frequently and shows you how to present your solutions for maximum marks." },
      { type: "heading", content: "Algebra & Equations" },
      { type: "list", content: ["Quadratic formula: x = (-b +/- sqrt(b^2 - 4ac)) / 2a", "Remainder theorem: If f(x) is divided by (x-a), remainder = f(a)", "Factorization: ab + ac = a(b + c)", "Simultaneous equations: Use substitution or elimination"] },
      { type: "heading", content: "Geometry & Trigonometry" },
      { type: "list", content: ["Pythagoras: a^2 + b^2 = c^2", "Circle area: pi x r^2, Circumference: 2 x pi x r", "Cylinder volume: pi x r^2 x h", "SOH-CAH-TOA for right triangle trigonometry"] },
      { type: "callout", content: "Examiner tip: Always state the formula before substituting values. Show at least one working step. Even if your final answer is wrong, correct method earns method marks." },
    ],
    category: "education", subcategory: "Examination Preparation", authorId: "a2", date: "2025-01-09", readTime: 11, tags: ["WAEC", "Mathematics", "Formulas", "Exam Prep"], featured: false, gradient: "from-orange-500 to-red-500",
  },
  {
    id: "e4", title: "Scholarships for Nigerian Students: 2025 Complete Directory",
    slug: "scholarships-nigerian-students-2025", excerpt: "A curated list of fully-funded and partially-funded scholarships available to Nigerian undergraduate and postgraduate students, with eligibility criteria and application deadlines.",
    content: [
      { type: "paragraph", content: "Nigerian students have access to over 50 international and local scholarships annually. This directory covers the most accessible and well-funded opportunities for 2025." },
      { type: "heading", content: "Fully Funded International Scholarships" },
      { type: "list", content: ["Chevening Scholarship (UK): Full tuition + stipend, deadline November", "Commonwealth Scholarships: For Masters/PhD in UK, deadline December", "MTN Foundation Scholarship: For Nigerian undergraduates, deadline March", "Dangote Foundation Scholarship: STEM-focused, deadline January", "Mastercard Foundation: Pan-African, covers full costs, deadline varies"] },
      { type: "heading", content: "Application Tips That Work" },
      { type: "paragraph", content: "Start preparing documents 3 months before deadlines. Write a compelling personal statement that connects your background to your future goals. Get recommendation letters from professors who know your work personally." },
      { type: "callout", content: "Common mistake: Applying to only one scholarship. Successful candidates apply to 5-10 programs simultaneously, tailoring each application to the specific funder's priorities." },
    ],
    category: "education", subcategory: "Scholarships", authorId: "a4", date: "2025-01-07", readTime: 9, tags: ["Scholarships", "Study Abroad", "Funding", "Nigeria"], featured: true, gradient: "from-purple-600 to-violet-500",
  },
  {
    id: "e5", title: "Best Online Learning Platforms for African Students (Free & Paid)",
    slug: "online-learning-platforms-africa", excerpt: "A comprehensive review of the best e-learning platforms accessible from Nigeria and across Africa, covering course quality, pricing, and mobile experience.",
    content: [
      { type: "paragraph", content: "Online learning has democratized education across Africa. But not all platforms work well with Nigerian internet speeds, payment methods, or curriculum needs. Here is our tested ranking." },
      { type: "heading", content: "Free Platforms" },
      { type: "list", content: ["Khan Academy: Best for math and science foundations, works offline", "Coursera Audit Mode: Access course materials free, pay only for certificates", "edX Audit Track: Similar to Coursera, great for university-level content", "Alison: Free certificates, wide range of vocational courses"] },
      { type: "heading", content: "Paid Platforms Worth the Investment" },
      { type: "paragraph", content: "Udemy courses go for as low as 10,000 Naira during sales. For professional development, Coursera Plus at $59/month gives unlimited access to 7,000+ courses from top universities." },
      { type: "callout", content: "Low-bandwidth tip: Download courses on WiFi and study offline. Khan Academy, Coursera, and Udemy all support offline downloads on mobile." },
    ],
    category: "education", subcategory: "Online Learning", authorId: "a6", date: "2025-01-04", readTime: 8, tags: ["Online Learning", "Platforms", "Africa", "Free Courses"], featured: false, gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "e6", title: "University Admission Guide: How to Choose the Right Course and School in Nigeria",
    slug: "university-admission-guide-nigeria", excerpt: "A practical framework for Nigerian students to evaluate universities, choose courses aligned with career goals, and navigate the admission process successfully.",
    content: [
      { type: "paragraph", content: "Choosing a university and course is one of the most consequential decisions a Nigerian student makes. This guide provides a structured framework to make an informed choice." },
      { type: "heading", content: "Evaluating Universities" },
      { type: "list", content: ["Accreditation: Verify NUC accreditation for the specific program", "Employability: Research graduate employment rates and industry partnerships", "Facilities: Visit campus if possible, check library, labs, and internet access", "Location: Consider cost of living, safety, and proximity to industry hubs", "Alumni Network: Strong alumni communities open doors after graduation"] },
      { type: "heading", content: "Matching Course to Career" },
      { type: "paragraph", content: "Do not choose a course based solely on JAMB subject combination. Research what professionals in that field actually do day-to-day. Talk to at least three people working in roles you aspire to." },
      { type: "paragraph", content: "Post-UTME preparation is equally critical. Each university has its own format: some test current affairs, others focus on your chosen field. Start preparing at least 3 weeks before the scheduled date." },
    ],
    category: "education", subcategory: "University Guides", authorId: "a2", date: "2024-12-30", readTime: 10, tags: ["University", "Admission", "Course Selection", "Nigeria"], featured: false, gradient: "from-teal-500 to-green-600",
  },
  {
    id: "e7", title: "Study Techniques Backed by Science: What Actually Works for Exams",
    slug: "science-backed-study-techniques", excerpt: "Evidence-based learning strategies including spaced repetition, active recall, and interleaving, adapted for Nigerian university and exam contexts.",
    content: [
      { type: "paragraph", content: "Most students study inefficiently. Re-reading notes and highlighting textbooks feel productive but produce minimal long-term retention. Here are techniques proven by cognitive science research." },
      { type: "heading", content: "Active Recall" },
      { type: "paragraph", content: "Instead of re-reading, close your book and try to recall information from memory. Use flashcards or write summaries from scratch. This retrieval practice strengthens neural pathways far more than passive review." },
      { type: "heading", content: "Spaced Repetition" },
      { type: "paragraph", content: "Review material at increasing intervals: 1 day, 3 days, 7 days, 14 days, 30 days. Apps like Anki automate this process. For WAEC or JAMB prep, start spaced repetition at least 8 weeks before the exam." },
      { type: "callout", content: "The testing effect: Students who take practice tests retain 50% more information than students who spend the same time re-reading material. Mock exams are not just preparation, they are the most effective study method." },
    ],
    category: "education", subcategory: "Study Resources", authorId: "a6", date: "2024-12-25", readTime: 7, tags: ["Study Tips", "Science", "Memory", "Exams"], featured: false, gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "e8", title: "Student Productivity: Managing Assignments, Exams, and Side Projects",
    slug: "student-productivity-guide", excerpt: "A practical system for Nigerian students to balance academic workload, personal projects, and rest without burning out.",
    content: [
      { type: "paragraph", content: "The combination of demanding coursework, part-time work, and personal projects creates a productivity crisis for many students. This guide offers a realistic system that accounts for Nigerian university schedules." },
      { type: "heading", content: "The Weekly Planning Method" },
      { type: "list", content: ["Sunday evening: Review the week ahead, identify deadlines and exams", "Block time for lectures, study sessions, and project work", "Set one primary goal per day (not five)", "Include buffer time for unexpected delays, power outages, or schedule changes", "Friday evening: Review what was completed, adjust next week plan"] },
      { type: "heading", content: "Tools That Work Offline" },
      { type: "paragraph", content: "Not every productivity tool requires constant internet. Use physical notebooks, local apps, or simple spreadsheets. The best system is the one you actually maintain consistently." },
    ],
    category: "education", subcategory: "Student Productivity", authorId: "a6", date: "2024-12-18", readTime: 6, tags: ["Productivity", "Time Management", "Students"], featured: false, gradient: "from-lime-500 to-green-600",
  },
  {
    id: "e9", title: "Career Opportunities in Tech for Non-Computer Science Graduates",
    slug: "tech-careers-non-cs-graduates", excerpt: "How graduates from any discipline can break into tech careers through targeted skills, portfolio building, and strategic networking in the Nigerian market.",
    content: [
      { type: "paragraph", content: "You do not need a Computer Science degree to build a successful tech career. Some of the best product managers, UX designers, and data analysts come from non-traditional backgrounds." },
      { type: "heading", content: "Entry Points into Tech" },
      { type: "list", content: ["UI/UX Design: Learn Figma, build 3 portfolio projects, apply to agencies", "Data Analysis: Master Excel, SQL, and Python basics, target fintech companies", "Technical Writing: Strong English + basic coding knowledge = high demand", "QA Testing: Learn testing frameworks, get ISTQB certified, join startups", "Product Management: Domain expertise + communication skills + tech literacy"] },
      { type: "paragraph", content: "The Nigerian tech ecosystem is growing rapidly. Companies like Flutterwave, Paystack, Interswitch, and dozens of startups hire from diverse educational backgrounds. Focus on demonstrating skills, not credentials." },
    ],
    category: "education", subcategory: "Career Opportunities", authorId: "a4", date: "2024-12-15", readTime: 8, tags: ["Career", "Tech Jobs", "Non-CS", "Nigeria"], featured: false, gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "e10", title: "Post-UTME Preparation: How to Score High in University Screening Exams",
    slug: "post-utme-preparation-guide", excerpt: "A comprehensive strategy for preparing for Post-UTME screening exams, covering common question patterns, subject-specific tips, and interview preparation.",
    content: [
      { type: "paragraph", content: "Post-UTME screening is the final hurdle before university admission. Each institution designs its own exam format, making targeted preparation essential rather than generic JAMB-style revision." },
      { type: "heading", content: "Common Post-UTME Formats" },
      { type: "list", content: ["CBT-based objective questions (UNILAG, UNN, ABU)", "Written essay-type exams (OAU, UI)", "Combined JAMB score + Post-UTME aggregate (most federal universities)", "Interview-based screening for competitive programs (Medicine, Law, Engineering)"] },
      { type: "heading", content: "Preparation Strategy" },
      { type: "paragraph", content: "Obtain past Post-UTME questions from your target university. Focus on current affairs, your chosen subject area, and general knowledge. Practice time management, many Post-UTME exams are shorter than JAMB but equally dense." },
      { type: "callout", content: "Important: Check your university's official website for the exact format, duration, and syllabus. Formats change annually, relying on outdated information is the most common reason for poor performance." },
    ],
    category: "education", subcategory: "Examination Preparation", authorId: "a2", date: "2024-12-10", readTime: 9, tags: ["Post-UTME", "Screening", "University", "Admission"], featured: false, gradient: "from-red-500 to-orange-500",
  },
];

export const TOOLS: ToolItem[] = [
  { id: "tool1", name: "Percentage Calculator", slug: "percentage-calculator", description: "Calculate percentages, percentage change, and percentage of a number instantly.", category: "Calculators", icon: "Percent", formula: "Percentage = (Part / Whole) x 100", howToUse: ["Enter the part value and whole value", "Select calculation type: find percentage, find part, or find whole", "View instant results with step-by-step breakdown"], inputs: [{ label: "Part Value", type: "number", placeholder: "e.g. 45" }, { label: "Whole Value", type: "number", placeholder: "e.g. 200" }], faq: [{ question: "How do I calculate percentage increase?", answer: "Subtract old value from new value, divide by old value, multiply by 100. Example: from 50 to 75 = (75-50)/50 x 100 = 50% increase." }], relatedArticleIds: ["e1"] },
  { id: "tool2", name: "GPA Calculator", slug: "gpa-calculator", description: "Calculate your Grade Point Average on 4.0 or 5.0 scales with detailed breakdown.", category: "Academic", icon: "GraduationCap", formula: "GPA = Sum of (Grade Points x Credit Units) / Total Credit Units", howToUse: ["Select your grading scale (4.0 or 5.0)", "Add each course with its grade and credit units", "View your calculated GPA with quality points breakdown"], inputs: [{ label: "Grading Scale", type: "select", placeholder: "Choose scale", options: ["4.0 Scale", "5.0 Scale (Nigerian)"] }, { label: "Course Grade", type: "select", placeholder: "Select grade", options: ["A", "B", "C", "D", "E", "F"] }, { label: "Credit Units", type: "number", placeholder: "e.g. 3" }], faq: [{ question: "What is the difference between GPA and CGPA?", answer: "GPA is for a single semester. CGPA (Cumulative GPA) averages across all semesters completed so far." }], relatedArticleIds: ["e1"] },
  { id: "tool3", name: "CGPA Calculator", slug: "cgpa-calculator", description: "Calculate your Cumulative GPA across multiple semesters on Nigerian 5.0 scale.", category: "Academic", icon: "Layers", formula: "CGPA = Total Quality Points (all semesters) / Total Units (all semesters)", howToUse: ["Add each semester's data: total quality points and total units", "The tool calculates your cumulative GPA automatically", "View your degree classification (First Class, 2:1, etc.)"], inputs: [{ label: "Semester Quality Points", type: "number", placeholder: "e.g. 45" }, { label: "Semester Total Units", type: "number", placeholder: "e.g. 10" }], faq: [{ question: "What CGPA do I need for First Class?", answer: "Most Nigerian universities require a CGPA of 4.50 or above on the 5.0 scale for First Class Honours." }], relatedArticleIds: ["e1", "e6"] },
  { id: "tool4", name: "Age Calculator", slug: "age-calculator", description: "Calculate exact age in years, months, and days from any date of birth.", category: "Calculators", icon: "Calendar", formula: "Age = Current Date - Birth Date (accounting for leap years)", howToUse: ["Enter your date of birth", "Select the reference date (defaults to today)", "View exact age in years, months, days, and total days"], inputs: [{ label: "Date of Birth", type: "date", placeholder: "Select date" }, { label: "Reference Date", type: "date", placeholder: "Defaults to today" }], faq: [{ question: "Does this account for leap years?", answer: "Yes, the calculator correctly handles leap years and gives exact day counts including February 29 occurrences." }], relatedArticleIds: [] },
  { id: "tool5", name: "Word Counter", slug: "word-counter", description: "Count words, sentences, paragraphs, and reading time from any text instantly.", category: "Text & Writing", icon: "Type", formula: "Words = Text split by whitespace. Reading time = Words / 200 WPM", howToUse: ["Paste or type your text in the input area", "View real-time word count, sentence count, and paragraph count", "See estimated reading time based on average reading speed"], inputs: [{ label: "Your Text", type: "textarea", placeholder: "Paste or type your text here..." }], faq: [{ question: "How is reading time calculated?", answer: "Average adult reading speed is approximately 200-250 words per minute. We use 200 WPM for a conservative estimate." }], relatedArticleIds: ["e7"] },
  { id: "tool6", name: "Character Counter", slug: "character-counter", description: "Count characters with and without spaces, plus social media limit checks.", category: "Text & Writing", icon: "Hash", formula: "Characters = Total length of string. Without spaces = Characters - Space count", howToUse: ["Enter your text to count", "View character count with and without spaces", "Check against Twitter, Instagram, and SMS limits"], inputs: [{ label: "Your Text", type: "textarea", placeholder: "Type text to count characters..." }], faq: [{ question: "Why do character limits matter?", answer: "Social media platforms enforce strict character limits. Twitter allows 280 characters, Instagram captions 2,200, and SMS segments 160 characters." }], relatedArticleIds: [] },
  { id: "tool7", name: "Text Case Converter", slug: "text-case-converter", description: "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case.", category: "Text & Writing", icon: "Clipboard", formula: "Each case follows specific transformation rules applied to word boundaries", howToUse: ["Paste your text into the converter", "Select the desired output case format", "Copy the converted text with one click"], inputs: [{ label: "Input Text", type: "textarea", placeholder: "Enter text to convert..." }, { label: "Target Case", type: "select", placeholder: "Select case", options: ["UPPERCASE", "lowercase", "Title Case", "camelCase", "snake_case", "kebab-case"] }], faq: [{ question: "What is the difference between camelCase and PascalCase?", answer: "camelCase starts with a lowercase letter (myVariableName), PascalCase starts with uppercase (MyVariableName). Both remove spaces between words." }], relatedArticleIds: ["t5"] },
  { id: "tool8", name: "Statistics & Hypothesis Testing Suite", slug: "average-calculator", description: "Full statistics toolkit: descriptive stats, T-tests, Z-tests, ANOVA, Chi-square, power analysis, alpha/beta, and normal curve visualization.", category: "Calculators", icon: "Calculator", formula: "Descriptive: Mean, Median, SD, Skewness, Kurtosis. Tests: Z=(x̄-μ)/(σ/√n), T=(x̄-μ)/(s/√n), F=MS_between/MS_within, χ²=Σ(O-E)²/E", howToUse: ["Enter your dataset or pick a preset for descriptive statistics", "Select a hypothesis test (Z, T, ANOVA, Chi-square) and configure α, tail, and data", "Use the Power tab to compute Type I/II error rates and required sample size", "Explore the Normal Curve tab to visualize critical regions and p-values"], inputs: [{ label: "Numbers", type: "text", placeholder: "e.g. 10, 20, 30, 40, 50" }], faq: [{ question: "What is the difference between a Z-test and a T-test?", answer: "A Z-test requires a known population standard deviation (σ) and works best with large samples (n≥30). A T-test uses the sample standard deviation (s) and is appropriate when σ is unknown or sample sizes are small." }, { question: "What does alpha (α) mean in hypothesis testing?", answer: "Alpha is the significance level — the probability of rejecting H₀ when it is actually true (Type I error). Common values are 0.05 (5%) and 0.01 (1%)." }, { question: "How do I interpret a p-value?", answer: "The p-value is the probability of observing a test statistic as extreme as yours, assuming H₀ is true. If p < α, you reject H₀ — the result is statistically significant." }, { question: "What is statistical power?", answer: "Power (1−β) is the probability of correctly rejecting a false H₀. A power of 0.80 means an 80% chance of detecting a true effect. Low power increases the risk of Type II errors (false negatives)." }], relatedArticleIds: ["e3"] },
  { id: "tool9", name: "Discount Calculator", slug: "discount-calculator", description: "Calculate final price, savings amount, and effective discount from any sale.", category: "Calculators", icon: "Tag", formula: "Savings = Original Price x (Discount% / 100). Final Price = Original - Savings.", howToUse: ["Enter the original price and discount percentage", "View the savings amount and final price", "Add multiple items to see total discount impact"], inputs: [{ label: "Original Price", type: "number", placeholder: "e.g. 50000" }, { label: "Discount Percentage", type: "number", placeholder: "e.g. 25" }], faq: [{ question: "How do I calculate a second discount on top of the first?", answer: "Apply discounts sequentially. If you get 20% off then an additional 10% off, the effective discount is 27%, not 30%. First discount: price x 0.80, then apply second: result x 0.90." }], relatedArticleIds: [] },
  { id: "tool10", name: "Loan Calculator", slug: "loan-calculator", description: "Calculate monthly payments, total interest, and amortization for any loan.", category: "Calculators", icon: "Scale", formula: "Monthly Payment = P x [r(1+r)^n] / [(1+r)^n - 1] where P=principal, r=monthly rate, n=months", howToUse: ["Enter loan principal, annual interest rate, and tenure in months", "View monthly payment amount and total interest over the loan", "See a year-by-year amortization breakdown"], inputs: [{ label: "Loan Amount", type: "number", placeholder: "e.g. 500000" }, { label: "Annual Interest Rate (%)", type: "number", placeholder: "e.g. 15" }, { label: "Tenure (Months)", type: "number", placeholder: "e.g. 24" }], faq: [{ question: "What is the typical loan interest rate in Nigeria?", answer: "Commercial bank loans in Nigeria typically range from 15% to 30% annually. Government-backed schemes like the CBN target credit facility offer lower rates around 9-12%." }], relatedArticleIds: [] },
  { id: "tool11", name: "Unit Converter", slug: "unit-converter", description: "Convert between length, weight, temperature, and data storage units instantly.", category: "Utilities", icon: "ArrowLeftRight", formula: "Each conversion uses a fixed multiplication factor between the source and target units", howToUse: ["Select the unit category (length, weight, temperature, data)", "Choose source and target units", "Enter the value to see instant conversion"], inputs: [{ label: "Category", type: "select", placeholder: "Select type", options: ["Length", "Weight", "Temperature", "Data Storage"] }, { label: "Value", type: "number", placeholder: "Enter value" }, { label: "From Unit", type: "text", placeholder: "e.g. kg" }, { label: "To Unit", type: "text", placeholder: "e.g. lbs" }], faq: [{ question: "How many bytes are in 1 GB?", answer: "1 GB = 1,073,741,824 bytes (binary/GiB) or 1,000,000,000 bytes (decimal/SI). Storage manufacturers use decimal, operating systems typically use binary." }], relatedArticleIds: [] },
  { id: "tool12", name: "QR Code Generator", slug: "qr-code-generator", description: "Generate QR codes from URLs, text, or contact information with download options.", category: "Utilities", icon: "QrCode", formula: "QR encoding follows ISO/IEC 18004 standard with error correction levels L, M, Q, or H", howToUse: ["Enter a URL or text content to encode", "Select error correction level and size", "Download the QR code as PNG or SVG"], inputs: [{ label: "URL or Text", type: "text", placeholder: "https://pearlhub.com" }, { label: "Error Correction", type: "select", placeholder: "Select level", options: ["Low (7%)", "Medium (15%)", "Quartile (25%)", "High (30%)"] }], faq: [{ question: "Do QR codes expire?", answer: "QR codes themselves never expire. However, if a QR code links to a URL that changes or goes offline, scanning it will no longer work. Use static content or registered domains for long-term QR codes." }], relatedArticleIds: [] },
];

export const SITE_STATS = { articles: 100, tools: 12, guides: 50, countries: 25 };