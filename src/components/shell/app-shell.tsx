"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavIcon } from "@/components/shell/icons";
import { Drawer } from "@/components/ui/feedback";
import { navFor, studentMobileNav, type NavItem } from "@/lib/nav";
import { initials } from "@/lib/utils";
import { signOutAction } from "@/server/actions";

export type ShellUser = {
  name: string;
  email: string;
  role: string;
  schoolName?: string | null;
};

export function AppShell({
  user,
  title,
  context,
  notices,
  children,
}: {
  user: ShellUser;
  title: string;
  context?: { label: string; href: string }[];
  notices?: { id: string; text: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = navFor(user.role);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bell, setBell] = useState(false);
  const [query, setQuery] = useState("");
  const searchHref = searchTarget(user.role);

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-sidebar text-white lg:flex">
        <div className="px-5 py-5">
          <Logo light />
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Primary">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
        <div className="px-4 py-4 text-xs text-slate-300">
          <p>{user.schoolName ?? "EduCore platform"}</p>
          <p className="mt-1">{roleLabel(user.role)}</p>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-line bg-white px-4">
          <button type="button" className="inline-flex min-h-touch min-w-11 items-center justify-center lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
            {context && context.length > 0 ? (
              <label className="mt-0.5 block text-xs text-muted">
                <span className="sr-only">Context</span>
                <select
                  className="max-w-full bg-transparent text-xs"
                  aria-label="School or class context"
                  defaultValue={context[0]?.href}
                  onChange={(event) => router.push(event.target.value)}
                >
                  {context.map((item) => (
                    <option key={item.href} value={item.href}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <form
            className="hidden min-w-0 flex-1 items-center lg:flex"
            onSubmit={(event) => {
              event.preventDefault();
              router.push(`${searchHref}?q=${encodeURIComponent(query)}`);
            }}
          >
            <label className="relative w-full max-w-md">
              <span className="sr-only">Search</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="min-h-touch w-full rounded-control border border-slate-200 pl-9 pr-3 text-sm"
              />
            </label>
          </form>
          <div className="relative">
            <button type="button" className="inline-flex min-h-touch min-w-11 items-center justify-center" aria-label="Notifications" aria-expanded={bell} onClick={() => setBell((value) => !value)}>
              <Bell size={18} />
            </button>
            {bell ? (
              <div className="absolute right-0 mt-2 w-72 rounded-card border border-line bg-white p-3 text-sm shadow-card">
                {(notices ?? []).length === 0 ? <p className="text-muted">No new notifications.</p> : notices?.map((notice) => <p key={notice.id} className="py-1">{notice.text}</p>)}
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button type="button" className="inline-flex min-h-touch items-center gap-2 rounded-control px-2" aria-label="Account menu" aria-expanded={menu} onClick={() => setMenu((value) => !value)}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{initials(user.name)}</span>
              <span className="hidden text-sm font-medium lg:inline">{user.name}</span>
            </button>
            {menu ? (
              <div className="absolute right-0 mt-2 w-56 rounded-card border border-line bg-white p-3 text-sm shadow-card">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted">{user.email}</p>
                <form action={signOutAction} className="mt-3">
                  <button className="min-h-touch w-full rounded-control bg-slate-100 text-sm" type="submit">
                    Sign out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </header>
        <main className="px-4 py-5 pb-24 md:px-6 lg:pb-8 xl:px-8 2xl:px-10">{children}</main>
      </div>

      {user.role === "STUDENT" ? (
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-white lg:hidden" aria-label="Mobile">
          {studentMobileNav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined} className={`flex min-h-touch flex-col items-center justify-center text-[11px] transition-colors hover:text-primary ${isActive(pathname, item.href) ? "text-primary" : "text-muted"}`}>
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <Drawer open={open} title="Menu" onClose={() => setOpen(false)}>
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold">{initials(user.name)}</span>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-slate-300">{roleLabel(user.role)}</p>
          </div>
        </div>
        <nav className="space-y-1" aria-label="Mobile menu">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined} onClick={() => setOpen(false)} className={`flex min-h-touch items-center gap-2 rounded-control px-2 text-sm transition-colors ${isActive(pathname, item.href) ? "bg-primary text-white" : "hover:bg-white/10"}`}>
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
      </Drawer>
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-touch items-center gap-2 rounded-control px-3 text-sm transition-colors duration-150 ${active ? "bg-primary text-white" : "text-slate-200 hover:bg-white/10"}`}>
      <NavIcon name={item.icon} />
      {item.label}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/student" || href === "/teacher" || href === "/admin" || href === "/owner") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function roleLabel(role: string) {
  switch (role) {
    case "STUDENT":
      return "Student";
    case "TEACHER":
      return "Teacher";
    case "ADMIN":
      return "School admin";
    case "OWNER":
      return "Platform owner";
    default:
      return role;
  }
}

function searchTarget(role: string) {
  switch (role) {
    case "TEACHER":
      return "/teacher/students";
    case "ADMIN":
      return "/admin/students";
    case "OWNER":
      return "/owner/users";
    default:
      return "/student/homework";
  }
}
