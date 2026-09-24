"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, Trash2, AlertTriangle, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function DataPrivacyCard() {
  const { user, logout } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmEmailInput, setConfirmEmailInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleExportData() {
    setExportError(null);
    setExporting(true);
    try {
      const blob = await api.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blood-test-analyser-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err?.message || "Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError(null);
    setDeleting(true);
    try {
      await api.deleteAccount();
      await logout();
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const isEmailMatching =
    confirmEmailInput.trim().toLowerCase() === (user?.email || "").toLowerCase();

  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-primary-dark mb-1">Data & Privacy</h2>
        <p className="text-xs text-slate-500 mb-6">
          Manage data export and permanent account deletion
        </p>

        {/* Export Data Section */}
        <div className="pb-6 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Export Personal Data</h3>
          <p className="text-xs text-slate-500 mb-3">
            Download a JSON copy of all your analyzed blood test reports and health profile records.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="flex items-center gap-2 bg-primary-dark text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-primary transition-colors cursor-pointer disabled:opacity-60"
          >
            <Download size={14} />
            {exporting ? "Preparing Export..." : "Export my data"}
          </button>
          {exportError && (
            <p className="text-xs text-red-600 mt-2 font-medium">{exportError}</p>
          )}
        </div>

        {/* Delete Account Section */}
        <div className="pt-6">
          <h3 className="text-sm font-semibold text-red-600 mb-1">Delete Account</h3>
          <p className="text-xs text-slate-500 mb-3">
            Permanently delete your account and remove all health records and history from our database.
          </p>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            Delete my account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Radix Dialog */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-xl shadow-xl border border-slate-100 p-6 z-50 focus:outline-none">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} />
                <Dialog.Title className="text-base font-semibold">
                  Confirm Account Deletion
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 rounded-md p-1 cursor-pointer">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This permanently deletes your reports and profile. This action cannot be undone. Please type your email{" "}
              <span className="font-semibold text-slate-800">{user?.email}</span> to confirm deletion:
            </p>

            <input
              type="email"
              value={confirmEmailInput}
              onChange={(e) => setConfirmEmailInput(e.target.value)}
              placeholder={user?.email || "user@example.com"}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />

            {deleteError && (
              <p className="text-xs text-red-600 mb-3 font-medium">{deleteError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isEmailMatching || deleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
