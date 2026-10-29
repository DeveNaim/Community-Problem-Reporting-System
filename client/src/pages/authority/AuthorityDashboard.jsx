import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { apiFetch } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  extractAuthorityEmailToken,
  getAuthorityCategoryFromUser,
} from '../../utils/authorityCategory.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const STATUS_COLORS = {
  'Pending Verification': 'rgba(245, 158, 11, 0.85)',
  Verified: 'rgba(59, 130, 246, 0.85)',
  Assigned: 'rgba(99, 102, 241, 0.85)',
  'In Progress': 'rgba(139, 92, 246, 0.85)',
  Resolved: 'rgba(16, 185, 129, 0.85)',
  Rejected: 'rgba(244, 63, 94, 0.85)',
  'Unable to Resolve': 'rgba(100, 116, 139, 0.85)',
};

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const authorityCategory = getAuthorityCategoryFromUser(user);
  const emailToken = extractAuthorityEmailToken(user?.email);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/analytics/summary');
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || 'Failed to load authority dashboard overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleDeleteConfirm() {
    if (!complaintToDelete) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await apiFetch(`/api/complaints/${complaintToDelete.id}`, { method: 'DELETE' });
      setFeedback(`Complaint ${complaintToDelete.complaintId} deleted successfully.`);
      setComplaintToDelete(null);
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Failed to delete complaint.');
    } finally {
      setDeleting(false);
    }
  }

  const trendChartData = {
    labels: summary?.monthlyTrend?.map((m) => m.label) || [],
    datasets: [
      {
        label: 'Reported in Category',
        data: summary?.monthlyTrend?.map((m) => m.submitted) || [],
        borderColor: 'rgb(29, 78, 216)',
        backgroundColor: 'rgba(29, 78, 216, 0.12)',
        borderWidth: 2.5,
        pointBackgroundColor: 'rgb(29, 78, 216)',
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Resolved',
        data: summary?.monthlyTrend?.map((m) => m.resolved) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 2.5,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const statusChartData = {
    labels: summary?.byStatus?.map((item) => item.status) || [],
    datasets: [
      {
        data: summary?.byStatus?.map((item) => item.count) || [],
        backgroundColor:
          summary?.byStatus?.map(
            (item) => STATUS_COLORS[item.status] || 'rgba(107, 114, 128, 0.8)'
          ) || [],
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Authority Workspace
            </span>
            <span className="text-sm text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-600">Department Dashboard</span>
            {authorityCategory && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Auto-Scoped: {authorityCategory}
                {emailToken ? ` (.${emailToken}@)` : ''}
              </span>
            )}
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {user?.name || 'Department Authority Dashboard'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Automatically filtered to <strong className="font-semibold text-slate-800">{authorityCategory || 'your department'}</strong> complaints based on your authority account (<code className="font-mono text-xs text-blue-700">{user?.email}</code>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>

          <Link
            to="/assigned/analytics"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-2xs transition hover:bg-blue-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics & Export</span>
          </Link>

          <Link
            to="/assigned/complaints"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-600"
          >
            <span>Manage Complaints</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded-lg px-2 py-1 text-emerald-900 hover:bg-emerald-100 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="mt-4 h-9 w-20 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-36 rounded bg-slate-100" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
            <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to Load Department Dashboard"
          message="We couldn't fetch your department's complaint metrics and recent reports. Click Retry below to reload."
          errorDetail={error}
          onRetry={loadDashboard}
          retrying={loading}
        />
      ) : !summary ? (
        <EmptyState
          title="No department metrics available"
          description="No complaints found for your department category yet."
        />
      ) : (
        <>
          {/* Primary KPI Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {authorityCategory || 'Department'} Complaints
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">
                {summary.totalComplaints}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">Scoped to {authorityCategory}</span>
                <Link to="/assigned/complaints" className="font-semibold text-blue-700 hover:text-blue-900">
                  Open queue →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Resolution Rate
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-emerald-700">
                {summary.resolvedPercent ?? 0}%
              </p>
              <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-slate-500">
                <span>
                  {summary.resolvedCount ?? 0} resolved ·{' '}
                  {summary.closedCount ??
                    (summary.rejectedCount ?? 0) + (summary.unableToResolveCount ?? 0)}{' '}
                  closed
                </span>
                <span className="font-semibold text-slate-700">
                  Avg: {summary.averageResolutionDays ?? '—'}d
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active / Assigned
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-indigo-700">
                {summary.inProgressCount ?? 0}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500">
                  {summary.verifiedCount ?? 0} verified · {summary.assignedCount ?? 0} assigned ·{' '}
                  {summary.inProgressOnlyCount ?? 0} in progress
                </span>
                <Link to="/assigned/complaints" className="font-semibold text-blue-700 hover:text-blue-900">
                  Update →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pending Verification
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-amber-700">
                {summary.pendingVerificationCount ?? 0}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>New incoming reports</span>
                <span className="font-mono text-xs text-slate-600">.{emailToken || 'dept'}</span>
              </div>
            </div>
          </div>

          {/* Chart.js Row: Monthly Trend Line Chart + Status Doughnut Chart */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-2">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {authorityCategory || 'Department'} Monthly Trend (Reported vs. Resolved)
                  </h2>
                  <p className="text-sm text-slate-500">
                    6-month submission and resolution trajectory for your department
                  </p>
                </div>
                <Link
                  to="/assigned/analytics"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span>Full Analytics</span>
                  <span>→</span>
                </Link>
              </div>
              <div className="h-72">
                <Line
                  data={trendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0, font: { size: 12 } },
                        grid: { color: 'rgba(226, 232, 240, 0.7)' },
                      },
                      x: {
                        ticks: { font: { size: 12 } },
                        grid: { display: false },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">Status Distribution</h2>
                <p className="text-sm text-slate-500">Current workflow breakdown</p>
              </div>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={statusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '62%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 14, font: { size: 12 } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Department Complaints Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent {authorityCategory || 'Department'} Complaints
                </h2>
                <p className="text-sm text-slate-500">
                  Automatically filtered to your department category with View, Edit, and Delete actions
                </p>
              </div>
              <Link
                to="/assigned/complaints"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <span>Manage All Department Complaints</span>
                <span>→</span>
              </Link>
            </div>

            {!summary.recentComplaints || summary.recentComplaints.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No complaints reported in {authorityCategory || 'your category'} yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Complaint</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.recentComplaints.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 truncate max-w-[240px]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            <span className="font-mono font-medium">{item.complaintId}</span>
                            {item.citizen ? ` · ${item.citizen.name}` : ''}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                          {item.location}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              to={`/complaints/${item.id}`}
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              View
                            </Link>
                            <Link
                              to={`/complaints/${item.id}/edit`}
                              className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs transition hover:bg-amber-100"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setComplaintToDelete(item)}
                              className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
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
        </>
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(complaintToDelete)}
        title="Delete Complaint?"
        message="Are you sure you want to delete this complaint record? All timeline history and images will be permanently removed."
        itemDetail={
          complaintToDelete
            ? `${complaintToDelete.complaintId}: "${complaintToDelete.title}"`
            : null
        }
        confirmLabel="Yes, Delete Record"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setComplaintToDelete(null)}
      />
    </div>
  );
}

