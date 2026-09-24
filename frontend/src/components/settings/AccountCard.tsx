"use client";

import { useAuth } from "@/hooks/useAuth";
import { User, LogOut } from "lucide-react";

export default function AccountCard() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-primary-dark">Account Details</h2>
          <p className="text-xs text-slate-500">Your logged-in patient account profile</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>

      <div className="flex items-center gap-4 py-4 border-t border-slate-100">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-base">
          {user?.name?.[0] || <User size={20} />}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
          <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
        </div>
      </div>
    </div>
  );
}
