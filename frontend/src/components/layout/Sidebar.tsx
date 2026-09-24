"use client";
import { LayoutDashboard, History, HeartPulse, Settings, HelpCircle, Droplet, ChevronDown, LogOut } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import TechStackFooter from "./TechStackFooter";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Reports History", icon: History, href: "/dashboard/history" },
  { label: "Health Profile", icon: HeartPulse, href: "/dashboard/profile" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  { label: "Support", icon: HelpCircle, href: "/dashboard/support" },
];





export default function Sidebar({ activeHref = "/dashboard" }: { activeHref?: string }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-[20%] min-w-[220px] bg-card border-r border-slate-100 flex flex-col justify-between py-6 px-4">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2">
          <Droplet className="text-red-500" size={26} fill="currentColor" />
          <div className="leading-tight">
            <p className="font-semibold text-primary-dark text-sm">Blood Test</p>
            <p className="font-semibold text-primary-dark text-sm -mt-0.5">Analyser</p>
          </div>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-full flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 mb-6 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                {user?.name?.[0] ?? "U"}
              </span>
              <span className="flex-1 text-left">{user?.name ?? "User"}</span>
              <ChevronDown size={14} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="bg-card rounded-lg shadow-md border border-slate-100 p-1 w-48 z-50">
            <DropdownMenu.Item
              onSelect={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer outline-none"
            >
              <LogOut size={14} /> Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <nav className="space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const active = href === activeHref;
            return (
              <a
                key={label}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary-dark text-white font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon size={16} />
                {label}
              </a>
            );
          })}
        </nav>
      </div>

      <TechStackFooter />
    </aside>
  );
}
