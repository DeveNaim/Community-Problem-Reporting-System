import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiFetch } from '../../api/client.js';
import AdminNav from '../../components/AdminNav.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import PasswordField from '../../components/PasswordField.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

export default function AdminAdmins() {
  const { user: currentAdmin } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);

  // Create Form State
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPassword, setCreatePassword] = useState('Admin123!');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/users?role=admin');
      setAdmins(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrator accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // Handle Create Admin
  async function handleCreateAdmin(e) {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError(null);

    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          role: 'admin',
          name: createName.trim(),
          email: createEmail.trim().toLowerCase(),
          phone: createPhone.trim(),
          password: createPassword,
        }),
      });

      setActionNotice(`Admin account for "${createName.trim()}" created successfully.`);
      setShowCreateModal(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePhone('');
      setCreatePassword('Admin123!');
      await loadAdmins();
    } catch (err) {
      setCreateError(err.message || 'Failed to create administrator.');
    } finally {
      setCreateSubmitting(false);
    }
  }

  // Open Edit Modal
  function handleOpenEdit(admin) {
    setAdminToEdit(admin);
    setEditName(admin.name);
    setEditPhone(admin.phone || '');
    setEditPassword('');
    setEditError(null);
  }

  // Handle Update Admin
  async function handleUpdateAdmin(e) {
    e.preventDefault();
    if (!adminToEdit) return;

    setEditSubmitting(true);
    setEditError(null);

    const payload = {
      name: editName.trim(),
      phone: editPhone.trim(),
    };
    if (editPassword.trim()) {
      payload.password = editPassword.trim();
    }

    try {
      await apiFetch(`/api/users/${adminToEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setActionNotice(`Administrator "${editName.trim()}" was updated successfully.`);
      setAdminToEdit(null);
      await loadAdmins();
    } catch (err) {
      setEditError(err.message || 'Failed to update administrator.');
    } finally {
      setEditSubmitting(false);
    }
  }

  // Handle Delete Admin (Strictly blocks deleting oneself)
  async function handleDeleteAdmin(adminId) {
    if (currentAdmin && (currentAdmin.id === adminId || currentAdmin.email === adminToDelete?.email)) {
      setError('Security policy: You cannot delete your own admin account.');
      setAdminToDelete(null);
      return;
    }

    try {
      await apiFetch(`/api/users/${adminId}`, { method: 'DELETE' });
      setActionNotice('Administrator account was deleted.');
      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    } catch (err) {
      setError(err.message || 'Failed to delete administrator.');
    } finally {
      setAdminToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminNav
        currentTitle="Admin Team Management"
        subtitle="Manage CPRS system administrators, grant administrative credentials, and update staff details. Admin accounts cannot delete their own profile."
      />

      {/* Global Alerts */}
      {actionNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="rounded-lg px-2 py-1 text-emerald-700 hover:bg-emerald-100 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <ErrorState
          variant={admins.length > 0 ? 'banner' : 'card'}
          title="Admin Account Operation Error"
          errorDetail={error}
          onRetry={loadAdmins}
          retrying={loading}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Top Bar with Metrics & Create Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            System Administrators ({admins.length})
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Full administrative privileges: triage complaints, assign authorities, and manage users
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAdmins}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-600 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Admin</span>
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 space-y-2.5">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
            <p>Loading administrators…</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p className="text-sm font-bold text-slate-700">No administrators found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-xs">
                <tr>
                  <th className="py-4 pl-6 pr-3">Admin Name</th>
                  <th className="px-4 py-4">Email (Login ID)</th>
                  <th className="px-4 py-4">Phone</th>
                  <th className="px-4 py-4">Role / Status</th>
                  <th className="px-4 py-4">Created Date</th>
                  <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((adm) => {
                  const isCurrentSessionUser =
                    currentAdmin &&
                    (currentAdmin.id === adm.id || currentAdmin.email === adm.email);

                  return (
                    <tr
                      key={adm.id}
                      className={`transition-colors hover:bg-slate-50/60 ${
                        isCurrentSessionUser ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Name & Badge */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-slate-900">{adm.name}</span>
                          {isCurrentSessionUser && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-700/15">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 font-mono text-xs text-slate-700">
                        {adm.email}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        {adm.phone || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          {adm.status}
                        </span>
                      </td>

                      {/* Created date */}
                      <td className="px-4 py-4 text-slate-500">
                        {adm.createdAt
                          ? new Date(adm.createdAt).toLocaleDateString()
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(adm)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          {/* Delete Button (Strictly disabled for oneself) */}
                          {isCurrentSessionUser ? (
                            <span
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed select-none"
                              title="You cannot delete yourself"
                            >
                              Protected
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAdminToDelete(adm)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Create Admin */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create System Administrator</h3>
                <p className="text-sm text-slate-500">Grant full admin privileges to new team member</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="admin.john@cprs.local"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="01700000000"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <PasswordField
                id="createPassword"
                label="Admin Password *"
                required
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Admin123!"
              />

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 cursor-pointer disabled:opacity-60"
                >
                  {createSubmitting ? 'Creating…' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Admin */}
      {adminToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Update Administrator</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{adminToEdit.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdminToEdit(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateAdmin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <PasswordField
                id="editPassword"
                label="New Password (optional)"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdminToEdit(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 cursor-pointer disabled:opacity-60"
                >
                  {editSubmitting ? 'Updating…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: Delete Admin */}
      <DeleteConfirmModal
        isOpen={Boolean(adminToDelete)}
        title="Delete Administrator?"
        message="Are you sure you want to permanently remove this administrator? This action cannot be undone."
        itemDetail={adminToDelete ? `${adminToDelete.name} (${adminToDelete.email})` : null}
        confirmLabel="Yes, Delete Admin"
        onConfirm={() => handleDeleteAdmin(adminToDelete.id)}
        onClose={() => setAdminToDelete(null)}
      />
    </div>
  );
}
