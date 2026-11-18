export type NavItem = { href: string; label: string; icon: string };

export const studentNav: NavItem[] = [
  { href: "/student", label: "Home", icon: "layout" },
  { href: "/student/homework", label: "Homework", icon: "clipboard" },
  { href: "/student/progress", label: "My progress", icon: "chart" },
  { href: "/student/ai-study", label: "AI Study", icon: "spark" },
];

export const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Overview", icon: "layout" },
  { href: "/teacher/classes", label: "Classes", icon: "school" },
  { href: "/teacher/students", label: "Students", icon: "users" },
  { href: "/teacher/materials", label: "Materials", icon: "folder" },
  { href: "/teacher/homework", label: "Homework builder", icon: "pen" },
  { href: "/teacher/live", label: "Live sessions", icon: "video" },
  { href: "/teacher/analytics", label: "Analytics", icon: "chart" },
  { href: "/teacher/ai-helper", label: "AI teaching helper", icon: "spark" },
  { href: "/teacher/slots", label: "Slots", icon: "boxes" },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "School overview", icon: "layout" },
  { href: "/admin/staff", label: "Staff", icon: "users" },
  { href: "/admin/students", label: "Students", icon: "school" },
  { href: "/admin/classes", label: "Classes", icon: "book" },
  { href: "/admin/reports", label: "Reports", icon: "chart" },
  { href: "/admin/subscription", label: "Subscription", icon: "card" },
  { href: "/admin/support", label: "Support", icon: "life" },
];

export const ownerNav: NavItem[] = [
  { href: "/owner", label: "Global overview", icon: "layout" },
  { href: "/owner/schools", label: "Schools", icon: "school" },
  { href: "/owner/users", label: "Users", icon: "users" },
  { href: "/owner/subscriptions", label: "Subscriptions", icon: "card" },
  { href: "/owner/revenue", label: "Revenue", icon: "wallet" },
  { href: "/owner/ai-usage", label: "AI usage", icon: "spark" },
  { href: "/owner/support", label: "Support", icon: "life" },
  { href: "/owner/audit", label: "Audit log", icon: "scroll" },
  { href: "/owner/settings", label: "Settings", icon: "settings" },
];

export function navFor(role: string) {
  switch (role) {
    case "TEACHER":
      return teacherNav;
    case "ADMIN":
      return adminNav;
    case "OWNER":
      return ownerNav;
    default:
      return studentNav;
  }
}

export const studentMobileNav = studentNav;
