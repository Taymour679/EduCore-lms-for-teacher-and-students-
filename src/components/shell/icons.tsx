import {
  BarChart3,
  BookOpen,
  Boxes,
  ClipboardList,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  PenLine,
  School,
  ScrollText,
  Settings,
  Sparkles,
  Users,
  Video,
  Wallet,
} from "lucide-react";

const icons = {
  layout: LayoutDashboard,
  school: School,
  book: BookOpen,
  clipboard: ClipboardList,
  video: Video,
  spark: Sparkles,
  chart: BarChart3,
  life: LifeBuoy,
  users: Users,
  folder: FolderOpen,
  pen: PenLine,
  boxes: Boxes,
  card: CreditCard,
  wallet: Wallet,
  scroll: ScrollText,
  settings: Settings,
};

export function NavIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons] ?? LayoutDashboard;
  return <Icon size={18} aria-hidden="true" />;
}
