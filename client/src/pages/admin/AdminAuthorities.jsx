import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../api/client.js';
import AdminNav from '../../components/AdminNav.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import PasswordField from '../../components/PasswordField.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

const DEFAULT_EMAIL_DOMAIN = '@cprs.local';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^\w.]+/g, '')
    .replace(/\.+/g, '.');
}

export default function AdminAuthorities() {
  const [authorities, setAuthorities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Tabs: 'authorities' or 'categories'
  const [activeTab, setActiveTab] = useState('authorities');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [authorityToDelete, setAuthorityToDelete] = useState(null);

  // Create Authority Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [emailUsername, setEmailUsername] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [officerPassword, setOfficerPassword] = useState('Authority123!');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Add Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState(null);

  // Load Authorities & Categories
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [authData, catData] = await Promise.all([
        apiFetch('/api/users?role=authority'),
        apiFetch('/api/categories'),
      ]);
      setAuthorities(authData.users || []);
      setCategories(catData.categories || []);
    } catch (err) {
      setError(err.message || 'Failed to load authorities and categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When category changes, auto-suggest the username prefix while keeping domain default
  function handleCategorySelect(catName) {
    setSelectedCategory(catName);
    const catSlug = slugify(catName);
    setEmailUsername(`authority.${catSlug}`);
  }

  // Handle Create Authority
  async function handleCreateAuthority(e) {
    e.preventDefault();
    if (!selectedCategory) {
      setFormError('Please select a category first.');
      return;
    }
    if (!emailUsername.trim()) {
      setFormError('Please enter the email prefix.');
      return;
    }

    const fullEmail = `${emailUsername.trim().toLowerCase()}${DEFAULT_EMAIL_DOMAIN}`;
    setFormSubmitting(true);
    setFormError(null);

    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          role: 'authority',
          name: officerName.trim(),
          email: fullEmail,
          phone: officerPhone.trim(),
          password: officerPassword,
          category: selectedCategory,
          department: selectedCategory,
        }),
      });

      setActionNotice(
        `Authority for "${selectedCategory}" created successfully with login email: ${fullEmail}`
      );
      setShowCreateModal(false);
      resetAuthorityForm();
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to create authority.');
    } finally {
      setFormSubmitting(false);
    }
  }

  function resetAuthorityForm() {
    setSelectedCategory('');
    setEmailUsername('');
    setOfficerName('');
    setOfficerPhone('');
    setOfficerPassword('Authority123!');
    setFormError(null);
  }

  // Handle Delete Authority
  async function handleDeleteAuthority(authId) {
    try {
      await apiFetch(`/api/users/${authId}`, { method: 'DELETE' });
      setActionNotice('Authority account was removed.');
      setAuthorities((prev) => prev.filter((a) => a.id !== authId));
    } catch (err) {
      setError(err.message || 'Failed to delete authority.');
    } finally {
      setAuthorityToDelete(null);
    }
  }

  // Handle Toggle Authority Status
  async function handleToggleStatus(authority) {
    const nextStatus = authority.status === 'active' ? 'disabled' : 'active';
    try {
      await apiFetch(`/api/users/${authority.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      setAuthorities((prev) =>
        prev.map((a) => (a.id === authority.id ? { ...a, status: nextStatus } : a))
      );
      setActionNotice(`Authority status changed to ${nextStatus}.`);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  }

  // Handle Create Category
  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCatError('Category name is required.');
      return;
    }

    setCatSubmitting(true);
    setCatError(null);

    try {
      await apiFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDescription.trim(),
        }),
      });

      setActionNotice(`Category "${newCatName.trim()}" created successfully.`);
      setShowAddCategoryModal(false);
      setNewCatName('');
      setNewCatDescription('');
      await loadData();
    } catch (err) {
      setCatError(err.message || 'Failed to add category.');
    } finally {
      setCatSubmitting(false);
    }
  }

  // Handle Delete Category
  async function handleDeleteCategory(catId, catName) {
    try {
      await apiFetch(`/api/categories/${catId}`, { method: 'DELETE' });
      setActionNotice(`Category "${catName}" has been deleted.`);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
    } catch (err) {
      setError(err.message || 'Failed to delete category.');
    } finally {
      setCategoryToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminNav
        currentTitle="Authority & Category Management"
        subtitle="Provision municipal department officers, configure authority email addresses by category, and manage problem report categories."
      />

      {/* Global Notice / Error */}
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
          variant={authorities.length > 0 || categories.length > 0 ? 'banner' : 'card'}
          title="Unable to Load Authorities & Categories"
          errorDetail={error}
          onRetry={loadData}
          retrying={loading}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Actions and Tabs Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('authorities')}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
              activeTab === 'authorities'
                ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Department Authorities ({authorities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Report Categories ({categories.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'authorities' ? (
            <button
              type="button"
              onClick={() => {
                resetAuthorityForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-600 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Authority</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCatError(null);
                setNewCatName('');
                setNewCatDescription('');
                setShowAddCategoryModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-600 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content: 1. Authorities List */}
      {activeTab === 'authorities' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Assigned Municipal Department Authorities ({authorities.length})
            </h2>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500 space-y-2.5">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
              <p>Loading authorities…</p>
            </div>
          ) : authorities.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-sm font-bold text-slate-700">No authorities created yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Click "Create Authority" above to add department officers.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-xs">
                  <tr>
                    <th className="py-4 pl-6 pr-3">Authority Name</th>
                    <th className="px-4 py-4">Assigned Category</th>
                    <th className="px-4 py-4">Email (Login)</th>
                    <th className="px-4 py-4">Phone</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authorities.map((auth) => (
                    <tr key={auth.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="py-4 pl-6 pr-3 font-semibold text-slate-900">
                        {auth.name}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-700/15">
                          {auth.category || auth.department || 'General / All'}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        {auth.email}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        {auth.phone || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            auth.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                              : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              auth.status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          {auth.status}
                        </span>
                      </td>
                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(auth)}
                            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer ${
                              auth.status === 'active'
                                ? 'border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {auth.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthorityToDelete(auth)}
                            className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: 2. Categories Management (Admin can delete category) */}
      {activeTab === 'categories' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Problem Report Categories ({categories.length})
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Categories define community complaint classification and authority assignments.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div
                key={cat.id || cat.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 px-6 gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-slate-900">{cat.name}</span>
                    {cat.isDefault && (
                      <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {cat.description || 'General municipal category'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(cat)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 hover:border-rose-300 cursor-pointer transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Category</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Create Authority (Category First -> Default Domain with modifiable name) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Department Authority</h3>
                <p className="text-sm text-slate-500">
                  Select category first to configure department login credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAuthority} className="mt-5 space-y-4">
              {/* STEP 1: Select Category First */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-blue-900">
                  1. Select Department Category *
                </label>
                <p className="text-xs text-slate-500 mb-1.5">
                  Pick the department this authority officer will manage
                </p>
                <select
                  required
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Choose Category First --</option>
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 2: Email username prefix (domain is default, name only can modify) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  2. Authority Email (Login ID) *
                </label>
                <p className="text-xs text-slate-500 mb-1.5">
                  Domain <code className="font-mono text-blue-700 font-semibold">{DEFAULT_EMAIL_DOMAIN}</code> is locked by default. Modify the prefix only:
                </p>

                <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 bg-white">
                  <input
                    type="text"
                    required
                    value={emailUsername}
                    onChange={(e) => setEmailUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'))}
                    placeholder="authority.name"
                    className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none"
                  />
                  <span className="bg-slate-100 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-600 border-l border-slate-200 select-none">
                    {DEFAULT_EMAIL_DOMAIN}
                  </span>
                </div>

                {emailUsername && (
                  <p className="mt-1.5 text-xs text-emerald-700 font-medium">
                    Full Login Email:{' '}
                    <span className="font-mono font-bold">
                      {emailUsername}
                      {DEFAULT_EMAIL_DOMAIN}
                    </span>
                  </p>
                )}
              </div>

              {/* STEP 3: Officer / Department Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  3. Officer or Department Title *
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. Roads & Highway Maintenance Officer"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* STEP 4: Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  4. Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={officerPhone}
                  onChange={(e) => setOfficerPhone(e.target.value)}
                  placeholder="01700000000"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* STEP 5: Password */}
              <PasswordField
                id="officerPassword"
                label="5. Initial Password *"
                required
                value={officerPassword}
                onChange={(e) => setOfficerPassword(e.target.value)}
                placeholder="Authority123!"
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
                  disabled={formSubmitting || !selectedCategory}
                  className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 cursor-pointer disabled:opacity-60"
                >
                  {formSubmitting ? 'Creating Authority…' : 'Create Authority'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New Category</h3>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {catError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
                {catError}
              </div>
            )}

            <form onSubmit={handleAddCategory} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Traffic Signals"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newCatDescription}
                  onChange={(e) => setNewCatDescription(e.target.value)}
                  placeholder="Describe what problems fall under this category…"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 cursor-pointer disabled:opacity-60"
                >
                  {catSubmitting ? 'Saving…' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: Delete Category */}
      <DeleteConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category?"
        message="Are you sure you want to delete this category? This action cannot be undone."
        itemDetail={categoryToDelete ? `Category: "${categoryToDelete.name}"` : null}
        confirmLabel="Yes, Delete Category"
        onConfirm={() => handleDeleteCategory(categoryToDelete.id, categoryToDelete.name)}
        onClose={() => setCategoryToDelete(null)}
      />

      {/* CONFIRM MODAL: Delete Authority */}
      <DeleteConfirmModal
        isOpen={Boolean(authorityToDelete)}
        title="Delete Authority Account?"
        message="Are you sure you want to permanently delete this departmental authority account?"
        itemDetail={
          authorityToDelete ? `${authorityToDelete.name} (${authorityToDelete.email})` : null
        }
        confirmLabel="Yes, Delete Authority"
        onConfirm={() => handleDeleteAuthority(authorityToDelete.id)}
        onClose={() => setAuthorityToDelete(null)}
      />
    </div>
  );
}
