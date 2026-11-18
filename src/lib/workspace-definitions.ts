export type WorkspaceRole = "TEACHER" | "ADMIN" | "OWNER";
export type WorkspaceField = {
  name: string;
  label: string;
  type?: "text" | "email" | "date" | "number" | "select" | "textarea";
  required?: boolean;
  options?: string[];
};
export type WorkspaceRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  data: Record<string, string>;
};
export type WorkspaceDefinition = {
  title: string;
  description: string;
  entity: string;
  columns: { key: string; label: string }[];
  fields: WorkspaceField[];
  filters?: string[];
  metrics?: { label: string; value: string; note: string }[];
  records: WorkspaceRecord[];
  createLabel?: string;
  readOnly?: boolean;
  chart?: { title: string; kind: "trend" | "bar"; labels: string[]; values: number[]; comparison?: number[] };
  secondaryChart?: { title: string; kind: "trend" | "bar"; labels: string[]; values: number[]; comparison?: number[] };
  assistant?: boolean;
  settings?: boolean;
  attendanceDemo?: boolean;
  export?: boolean;
};

const record = (id: string, title: string, subtitle: string, status: string, data: Record<string, string> = {}): WorkspaceRecord => ({ id, title, subtitle, status, data });
const field = (name: string, label: string, type: WorkspaceField["type"] = "text", required = true, options?: string[]): WorkspaceField => ({ name, label, type, required, options });

export const workspaceDefinitions: Record<string, WorkspaceDefinition> = {
  "TEACHER/classes": {
    title: "Classes", description: "Your assigned classes and the learners in each group.", entity: "class", readOnly: true,
    columns: [{ key: "subject", label: "Subject" }, { key: "yearGroup", label: "Year" }, { key: "students", label: "Students" }, { key: "room", label: "Room" }], fields: [],
    records: [
      record("tc-1", "Year 9 Mathematics", "Mon, Wed · 09:00", "Active", { subject: "Mathematics", yearGroup: "Year 9", students: "28", room: "Room 204" }),
      record("tc-2", "Year 10 Mathematics", "Tue, Thu · 11:00", "Active", { subject: "Mathematics", yearGroup: "Year 10", students: "24", room: "Room 204" }),
      record("tc-3", "Year 8 Mathematics", "Fri · 10:00", "Active", { subject: "Mathematics", yearGroup: "Year 8", students: "26", room: "Room 105" }),
    ],
  },
  "TEACHER/students": {
    title: "Students", description: "Learners enrolled in your classes, with current academic context.", entity: "student", readOnly: true,
    columns: [{ key: "yearGroup", label: "Year" }, { key: "classes", label: "Classes" }, { key: "average", label: "Recent average" }, { key: "email", label: "Email" }], filters: ["All students", "Needs review", "On track"], fields: [],
    records: [
      record("ts-1", "Amira Hassan", "Year 9 · Mathematics", "On track", { yearGroup: "Year 9", classes: "Mathematics 9A", average: "88%", email: "amira.hassan@example.test" }),
      record("ts-2", "Omar Farouk", "Year 9 · Mathematics", "Needs review", { yearGroup: "Year 9", classes: "Mathematics 9A", average: "64%", email: "omar.farouk@example.test" }),
      record("ts-3", "Layla Nassar", "Year 10 · Mathematics", "On track", { yearGroup: "Year 10", classes: "Mathematics 10B", average: "82%", email: "layla.nassar@example.test" }),
    ],
  },
  "TEACHER/materials": {
    title: "Materials", description: "Organize lesson resources by subject and class.", entity: "material", createLabel: "Add material",
    columns: [{ key: "kind", label: "Type" }, { key: "className", label: "Class" }, { key: "updated", label: "Added" }],
    fields: [field("title", "Material title"), field("subject", "Subject"), field("className", "Class"), field("kind", "Type", "select", true, ["Lesson notes", "Worksheet", "Reading", "Video"]), field("detail", "Description", "textarea", false)], filters: ["All materials", "Lesson notes", "Worksheet", "Reading", "Video"],
    records: [
      record("tm-1", "Linear graphs: lesson notes", "Mathematics · Year 9", "Lesson notes", { kind: "Lesson notes", className: "Year 9 Mathematics", updated: "Nov 17", detail: "Worked examples for gradient and intercept." }),
      record("tm-2", "Graph practice sheet", "Mathematics · Year 10", "Worksheet", { kind: "Worksheet", className: "Year 10 Mathematics", updated: "Nov 15", detail: "Practice questions on plotting straight lines." }),
      record("tm-3", "Coordinate geometry explainer", "Mathematics · Year 8", "Video", { kind: "Video", className: "Year 8 Mathematics", updated: "Nov 12", detail: "A short visual introduction to the coordinate plane." }),
    ],
  },
  "TEACHER/homework": {
    title: "Homework builder", description: "Create assignments and keep track of their progress.", entity: "homework", createLabel: "Create assignment",
    columns: [{ key: "subject", label: "Subject" }, { key: "className", label: "Class" }, { key: "dueLabel", label: "Due date" }, { key: "submissions", label: "Submissions" }], filters: ["All assignments", "Draft", "Published", "Closed"],
    fields: [field("title", "Assignment title"), field("subject", "Subject"), field("className", "Class", "select", true, ["Year 8 Mathematics", "Year 9 Mathematics", "Year 10 Mathematics"]), field("topic", "Topic"), field("dueDate", "Due date", "date"), field("points", "Points", "number"), field("status", "Status", "select", true, ["DRAFT", "PUBLISHED", "CLOSED"]), field("detail", "Instructions", "textarea")],
    records: [
      record("th-1", "Linear graphs practice", "Year 9 Mathematics · Due Nov 22", "PUBLISHED", { subject: "Mathematics", className: "Year 9 Mathematics", dueDate: "2026-11-22", dueLabel: "Nov 22", submissions: "19 / 28", topic: "Linear graphs", points: "20", detail: "Plot each line and describe its gradient." }),
      record("th-2", "Fractions review", "Year 8 Mathematics · Due Nov 25", "DRAFT", { subject: "Mathematics", className: "Year 8 Mathematics", dueDate: "2026-11-25", dueLabel: "Nov 25", submissions: "Not published", topic: "Fractions", points: "15", detail: "Practice simplifying fractions and ratios." }),
    ],
  },
  "TEACHER/live": {
    title: "Live sessions", description: "Schedule and manage online class sessions.", entity: "session", createLabel: "Schedule session",
    columns: [{ key: "className", label: "Class" }, { key: "dateLabel", label: "Date" }, { key: "time", label: "Time" }, { key: "host", label: "Host" }], filters: ["All sessions", "Scheduled", "Completed", "Cancelled"],
    fields: [field("title", "Session title"), field("className", "Class", "select", true, ["Year 8 Mathematics", "Year 9 Mathematics", "Year 10 Mathematics"]), field("date", "Date", "date"), field("time", "Start time"), field("endTime", "End time"), field("host", "Host"), field("detail", "Session notes", "textarea", false)],
    records: [
      record("tl-1", "Gradient problem-solving", "Year 9 Mathematics · Today", "Scheduled", { className: "Year 9 Mathematics", date: "2026-11-18", dateLabel: "Nov 18", time: "14:30", endTime: "15:00", host: "Mock Teacher", detail: "Bring graph paper and a calculator." }),
      record("tl-2", "Coordinate geometry Q&A", "Year 10 Mathematics · Nov 20", "Scheduled", { className: "Year 10 Mathematics", date: "2026-11-20", dateLabel: "Nov 20", time: "11:00", endTime: "11:45", host: "Mock Teacher", detail: "Question and answer session." }),
    ],
  },
  "TEACHER/analytics": {
    title: "Analytics", description: "Review class performance and assignment completion trends.", entity: "class report", readOnly: true, export: true,
    columns: [{ key: "students", label: "Students" }, { key: "average", label: "Average" }, { key: "completion", label: "Assignments with submissions" }, { key: "change", label: "Term change" }], fields: [],
    metrics: [{ label: "Learner average", value: "81%", note: "Across 78 learners" }, { label: "Assignments on time", value: "86%", note: "This term" }, { label: "Needs review", value: "7", note: "Learners below 70%" }],
    chart: { title: "Class performance trend", kind: "trend", labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"], values: [74, 77, 78, 80, 79, 83], comparison: [72, 73, 75, 76, 77, 78] },
    secondaryChart: { title: "Assignment completion by class", kind: "bar", labels: ["Year 8", "Year 9", "Year 10"], values: [85, 89, 84] },
    records: [record("ta-1", "Year 9 Mathematics", "Class report", "Active", { students: "28", average: "83%", completion: "89%", change: "+5 pts" }), record("ta-2", "Year 10 Mathematics", "Class report", "Active", { students: "24", average: "81%", completion: "84%", change: "+3 pts" }), record("ta-3", "Year 8 Mathematics", "Class report", "Active", { students: "26", average: "78%", completion: "85%", change: "+2 pts" })],
  },
  "TEACHER/ai-helper": {
    title: "AI teaching helper", description: "Draft lesson ideas and practice questions for your classes.", entity: "AI draft", readOnly: true, assistant: true,
    columns: [{ key: "type", label: "Type" }, { key: "className", label: "Class" }, { key: "updated", label: "Created" }], fields: [],
    records: [record("tai-1", "Linear graphs warm-up", "Lesson idea · Year 9 Mathematics", "Draft", { type: "Lesson idea", className: "Year 9 Mathematics", updated: "Nov 17", detail: "Use a local bus fare example to compare fixed cost and rate." })],
  },
  "TEACHER/slots": {
    title: "Slots", description: "Manage your available teaching times and sample bookings.", entity: "time slot", createLabel: "Add time slot",
    columns: [{ key: "date", label: "Date" }, { key: "time", label: "Time" }, { key: "booking", label: "Booking" }], filters: ["All slots", "Available", "Booked"],
    fields: [field("title", "Slot title"), field("date", "Date", "date"), field("time", "Start time"), field("endTime", "End time"), field("booking", "Booking or learner", "text", false)],
    records: [record("tsl-1", "Office hour", "Available for learners", "Available", { date: "Nov 19", time: "13:00", endTime: "13:30", booking: "Available" }), record("tsl-2", "Project check-in", "Booked by Amira Hassan", "Booked", { date: "Nov 20", time: "14:00", endTime: "14:30", booking: "Amira Hassan" })],
  },
  "ADMIN/staff": {
    title: "Staff", description: "Manage school staff and pending invitations.", entity: "staff record", createLabel: "Invite staff",
    columns: [{ key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "classes", label: "Classes" }], filters: ["All staff", "TEACHER", "ADMIN"],
    fields: [field("title", "Full name"), field("email", "Email", "email"), field("role", "Role", "select", true, ["TEACHER", "ADMIN"]), field("detail", "Title or subject", "text", false)],
    records: [record("as-1", "Nadia Patel", "Mathematics teacher", "Active", { email: "nadia.patel@example.test", role: "TEACHER", classes: "4", detail: "Mathematics · Year 8-10" }), record("as-2", "Daniel Morgan", "Science teacher", "Active", { email: "daniel.morgan@example.test", role: "TEACHER", classes: "3", detail: "Science · Year 9-11" }), record("as-3", "Samira Hassan", "School administrator", "Active", { email: "samira.hassan@example.test", role: "ADMIN", classes: "—", detail: "School operations" })],
  },
  "ADMIN/students": {
    title: "Students", description: "Student directory, year groups, and class enrollment.", entity: "student record", createLabel: "Invite student",
    columns: [{ key: "email", label: "Email" }, { key: "yearGroup", label: "Year" }, { key: "classes", label: "Enrolled classes" }, { key: "average", label: "Average" }], filters: ["All students", "On track", "Needs review"],
    fields: [field("title", "Full name"), field("email", "Email", "email"), field("yearGroup", "Year group"), field("classes", "Classes", "text", false)],
    records: [record("as-4", "Amira Hassan", "Year 9 · 3 classes", "On track", { email: "amira.hassan@example.test", yearGroup: "Year 9", classes: "Mathematics 9A, Science 9B", average: "88%" }), record("as-5", "Omar Farouk", "Year 9 · 3 classes", "Needs review", { email: "omar.farouk@example.test", yearGroup: "Year 9", classes: "Mathematics 9A, Science 9B", average: "64%" }), record("as-6", "Layla Nassar", "Year 10 · 4 classes", "On track", { email: "layla.nassar@example.test", yearGroup: "Year 10", classes: "4 classes", average: "82%" })],
  },
  "ADMIN/classes": {
    title: "Classes", description: "Create classes, assign teachers, and review enrollment.", entity: "class", createLabel: "Create class",
    columns: [{ key: "subject", label: "Subject" }, { key: "yearGroup", label: "Year" }, { key: "teacher", label: "Teacher" }, { key: "students", label: "Students" }, { key: "room", label: "Room" }],
    fields: [field("title", "Class name"), field("subject", "Subject"), field("yearGroup", "Year group"), field("teacher", "Assigned teacher"), field("room", "Room", "text", false), field("studentEmails", "Add student emails", "textarea", false)],
    records: [record("ac-1", "Year 9 Mathematics", "Mathematics · 9A", "Active", { subject: "Mathematics", yearGroup: "Year 9", teacher: "Nadia Patel", students: "28", room: "Room 204" }), record("ac-2", "Year 9 Science", "Science · 9B", "Active", { subject: "Science", yearGroup: "Year 9", teacher: "Daniel Morgan", students: "26", room: "Lab 2" }), record("ac-3", "Year 10 Mathematics", "Mathematics · 10B", "Active", { subject: "Mathematics", yearGroup: "Year 10", teacher: "Nadia Patel", students: "24", room: "Room 204" })],
  },
  "ADMIN/reports": {
    title: "Reports", description: "Academic performance and school activity reporting.", entity: "school report", readOnly: true, export: true, attendanceDemo: true,
    columns: [{ key: "subject", label: "Subject" }, { key: "classes", label: "Classes" }, { key: "average", label: "Average" }, { key: "completion", label: "Scores recorded" }], fields: [],
    metrics: [{ label: "School average", value: "81%", note: "Across scored assessments" }, { label: "Homework completed", value: "87%", note: "This term" }, { label: "Attendance", value: "Sample only", note: "No attendance model configured" }],
    chart: { title: "Academic performance", kind: "trend", labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"], values: [75, 77, 79, 78, 81, 82], comparison: [72, 74, 74, 76, 77, 78] },
    records: [record("ar-1", "Mathematics", "Subject report", "Reviewed", { subject: "Mathematics", classes: "6", average: "83%", completion: "89%" }), record("ar-2", "Science", "Subject report", "Reviewed", { subject: "Science", classes: "5", average: "81%", completion: "86%" }), record("ar-3", "English", "Subject report", "Reviewed", { subject: "English", classes: "5", average: "79%", completion: "84%" })],
  },
  "ADMIN/subscription": {
    title: "Subscription", description: "Current school plan, capacity, and billing history.", entity: "subscription", readOnly: true, export: true,
    columns: [{ key: "plan", label: "Plan" }, { key: "slots", label: "Learner capacity" }, { key: "price", label: "Price / month" }, { key: "renewal", label: "Billing record" }], fields: [],
    metrics: [{ label: "Current plan", value: "School Plus", note: "Annual subscription" }, { label: "Learner capacity", value: "612 / 700", note: "88% used" }, { label: "Next invoice", value: "EGP 42,000", note: "Due Dec 1" }],
    records: [record("asub-1", "School Plus", "Annual plan · Active", "Active", { plan: "School Plus", slots: "700 learners", price: "EGP 42,000", renewal: "Dec 1, 2026" }), record("asub-2", "Invoice · November", "Paid Nov 1, 2026", "PAID", { plan: "School Plus", slots: "—", price: "EGP 42,000", renewal: "Nov 1, 2026" })],
  },
  "ADMIN/support": {
    title: "Support", description: "Create and track requests for your school.", entity: "support ticket", createLabel: "New request",
    columns: [{ key: "category", label: "Category" }, { key: "created", label: "Created" }, { key: "owner", label: "Assigned to" }], filters: ["All tickets", "OPEN", "IN_PROGRESS", "RESOLVED"],
    fields: [field("title", "Request subject"), field("category", "Category", "select", true, ["Account", "Billing", "Technical", "Other"]), field("detail", "Describe the request", "textarea"), field("status", "Status", "select", true, ["OPEN", "IN_PROGRESS", "RESOLVED"])],
    records: [record("ast-1", "Unable to update class roster", "Technical · Updated today", "IN_PROGRESS", { category: "Technical", created: "Nov 17", owner: "EduCore Support", detail: "Roster changes are not appearing in the class view." }), record("ast-2", "Invoice copy requested", "Billing · Nov 12", "RESOLVED", { category: "Billing", created: "Nov 12", owner: "Billing team", detail: "Please provide a copy of the October invoice." })],
  },
  "OWNER/schools": {
    title: "Schools", description: "Manage registered schools and platform access status.", entity: "school", createLabel: "Add school",
    columns: [{ key: "city", label: "City" }, { key: "students", label: "Learners" }, { key: "plan", label: "Plan" }, { key: "created", label: "Joined" }], filters: ["All schools", "ACTIVE", "SUSPENDED"],
    fields: [field("title", "School name"), field("city", "City"), field("status", "Status", "select", true, ["ACTIVE", "SUSPENDED"])],
    records: [record("os-1", "Alexandria Learning Academy", "Alexandria · Active", "ACTIVE", { city: "Alexandria", students: "612", plan: "School Plus", created: "Aug 2024" }), record("os-2", "Nile Valley School", "Cairo · Active", "ACTIVE", { city: "Cairo", students: "480", plan: "School", created: "Jan 2025" }), record("os-3", "Delta Scholars", "Mansoura · Suspended", "SUSPENDED", { city: "Mansoura", students: "—", plan: "Trial", created: "Jun 2025" })],
  },
  "OWNER/users": {
    title: "Users", description: "Find platform users and review their roles and account status.", entity: "user", readOnly: true,
    columns: [{ key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "school", label: "School" }, { key: "created", label: "Joined" }], filters: ["All users", "STUDENT", "TEACHER", "ADMIN", "OWNER"], fields: [],
    records: [record("ou-1", "Amira Hassan", "Student · Alexandria Learning Academy", "ACTIVE", { email: "amira.hassan@example.test", role: "STUDENT", school: "Alexandria Learning Academy", created: "Sep 2024" }), record("ou-2", "Nadia Patel", "Teacher · Alexandria Learning Academy", "ACTIVE", { email: "nadia.patel@example.test", role: "TEACHER", school: "Alexandria Learning Academy", created: "Aug 2024" }), record("ou-3", "Samira Hassan", "Admin · Nile Valley School", "ACTIVE", { email: "samira.hassan@example.test", role: "ADMIN", school: "Nile Valley School", created: "Jan 2025" })],
  },
  "OWNER/subscriptions": {
    title: "Subscriptions", description: "Review plans, active subscriptions, and renewals.", entity: "subscription", createLabel: "Add subscription",
    columns: [{ key: "plan", label: "Plan" }, { key: "school", label: "School" }, { key: "slots", label: "Capacity" }, { key: "price", label: "Monthly price" }], filters: ["All subscriptions", "ACTIVE", "PAST_DUE", "CANCELLED"],
    fields: [field("title", "Plan name"), field("school", "School"), field("slots", "Learner slots", "number"), field("price", "Monthly price (EGP)", "number"), field("status", "Status", "select", true, ["ACTIVE", "PAST_DUE", "CANCELLED"])],
    records: [record("osub-1", "School Plus", "Alexandria Learning Academy", "ACTIVE", { plan: "School Plus", school: "Alexandria Learning Academy", slots: "700", price: "42000", renewal: "Dec 1" }), record("osub-2", "School", "Nile Valley School", "ACTIVE", { plan: "School", school: "Nile Valley School", slots: "550", price: "30000", renewal: "Dec 15" }), record("osub-3", "Trial", "Delta Scholars", "PAST_DUE", { plan: "Trial", school: "Delta Scholars", slots: "200", price: "0", renewal: "Nov 20" })],
  },
  "OWNER/revenue": {
    title: "Revenue", description: "Review subscription income and billing activity.", entity: "invoice", readOnly: true, export: true,
    columns: [{ key: "school", label: "School" }, { key: "issued", label: "Issued" }, { key: "amount", label: "Amount" }, { key: "invoiceStatus", label: "Status" }], fields: [],
    metrics: [{ label: "Monthly recurring", value: "EGP 248k", note: "Across active plans" }, { label: "Collected this month", value: "EGP 219k", note: "88% of issued invoices" }, { label: "Outstanding", value: "EGP 29k", note: "3 invoices due" }],
    chart: { title: "Subscription revenue (EGP thousands)", kind: "bar", labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"], values: [198, 211, 224, 231, 239, 248] },
    records: [record("oi-1", "Alexandria Learning Academy", "Invoice · Nov 1, 2026", "PAID", { school: "Alexandria Learning Academy", issued: "Nov 1", amount: "EGP 42,000", due: "Nov 1" }), record("oi-2", "Nile Valley School", "Invoice · Nov 1, 2026", "PAID", { school: "Nile Valley School", issued: "Nov 1", amount: "EGP 30,000", due: "Nov 1" }), record("oi-3", "Delta Scholars", "Invoice · Nov 1, 2026", "DUE", { school: "Delta Scholars", issued: "Nov 1", amount: "EGP 12,000", due: "Nov 20" })],
  },
  "OWNER/ai-usage": {
    title: "AI usage", description: "Monitor platform requests, token use, and estimated costs.", entity: "AI interaction", readOnly: true, export: true,
    columns: [{ key: "school", label: "School" }, { key: "requests", label: "Requests" }, { key: "tokens", label: "Tokens" }, { key: "cost", label: "Estimated cost" }], fields: [],
    metrics: [{ label: "Requests this month", value: "12,480", note: "Across 18 schools" }, { label: "Tokens used", value: "3.1M", note: "Input and output" }, { label: "Estimated cost", value: "EGP 4,820", note: "Based on recorded usage" }],
    chart: { title: "AI requests by month", kind: "trend", labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"], values: [7400, 8600, 9200, 10300, 11500, 12480], comparison: [6200, 7100, 8000, 8700, 9400, 10200] },
    records: [record("oai-1", "Alexandria Learning Academy", "School usage · November", "Active", { school: "Alexandria Learning Academy", requests: "3,140", tokens: "780k", cost: "EGP 1,210" }), record("oai-2", "Nile Valley School", "School usage · November", "Active", { school: "Nile Valley School", requests: "2,620", tokens: "640k", cost: "EGP 990" }), record("oai-3", "Delta Scholars", "School usage · November", "Active", { school: "Delta Scholars", requests: "860", tokens: "198k", cost: "EGP 310" })],
  },
  "OWNER/support": {
    title: "Support", description: "Track platform-wide support requests and their status.", entity: "support ticket", createLabel: "Create ticket",
    columns: [{ key: "school", label: "School" }, { key: "category", label: "Category" }, { key: "created", label: "Created" }, { key: "owner", label: "Assigned to" }], filters: ["All tickets", "OPEN", "IN_PROGRESS", "RESOLVED"],
    fields: [field("title", "Request subject"), field("school", "School"), field("category", "Category", "select", true, ["Account", "Billing", "Technical", "Other"]), field("detail", "Description", "textarea"), field("status", "Status", "select", true, ["OPEN", "IN_PROGRESS", "RESOLVED"])],
    records: [record("opt-1", "Cannot access staff invitation", "Alexandria Learning Academy", "OPEN", { school: "Alexandria Learning Academy", category: "Account", created: "Nov 18", owner: "Unassigned", detail: "Invitation link returns an expired message." }), record("opt-2", "Plan capacity question", "Nile Valley School", "IN_PROGRESS", { school: "Nile Valley School", category: "Billing", created: "Nov 17", owner: "Billing team", detail: "Please clarify available learner slots." })],
  },
  "OWNER/audit": {
    title: "Audit log", description: "Review platform actions and filter by actor, event, or date.", entity: "audit event", readOnly: true, export: true,
    columns: [{ key: "actor", label: "User" }, { key: "action", label: "Action" }, { key: "target", label: "Target" }, { key: "dateLabel", label: "Date" }], fields: [], filters: ["All activity", "USER", "SCHOOL", "SUBSCRIPTION"],
    records: [record("oa-1", "Nadia Patel", "USER · profile updated", "USER", { actor: "Nadia Patel", action: "Profile updated", target: "User · nadia.patel@example.test", date: "2026-11-18", dateLabel: "Nov 18 · 10:42" }), record("oa-2", "Platform owner", "SCHOOL · status changed", "SCHOOL", { actor: "Platform owner", action: "Status changed", target: "Delta Scholars", date: "2026-11-17", dateLabel: "Nov 17 · 16:08" }), record("oa-3", "Samira Hassan", "SUBSCRIPTION · invoice issued", "SUBSCRIPTION", { actor: "Samira Hassan", action: "Invoice issued", target: "Nile Valley School", date: "2026-11-17", dateLabel: "Nov 17 · 09:12" })],
  },
  "OWNER/settings": {
    title: "Settings", description: "Review local platform preferences and security controls.", entity: "platform setting", readOnly: true, settings: true,
    columns: [], fields: [],
    records: [record("cfg-1", "Require multi-factor authentication", "Security · Demo preference", "Enabled", { detail: "Require a second factor for platform owner accounts." }), record("cfg-2", "Notify owners about support escalations", "Notifications · Demo preference", "Enabled", { detail: "Send a notification when a high-priority support ticket is created." }), record("cfg-3", "Allow new school registrations", "Registration · Demo preference", "Enabled", { detail: "Allow school administrators to request a new school workspace." })],
  },
};

export function getWorkspaceDefinition(role: WorkspaceRole, section: string) {
  return workspaceDefinitions[`${role}/${section}`] ?? null;
}
