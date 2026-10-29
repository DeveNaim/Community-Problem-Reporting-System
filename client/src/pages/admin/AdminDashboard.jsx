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
import { Bar, Doughnut } from 'react-chartjs-2';
import { apiFetch } from '../../api/client.js';
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

export default function AdminDashboard() {
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
      setError(err.message || 'Failed to load dashboard overview.');
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

  const categoryChartData = {
    labels: summary?.byCategory?.map((item) => item.category) || [],
    datasets: [
      {
        label: 'Total Complaints',
        data: summary?.byCategory?.map((item) => item.count) || [],
        backgroundColor: 'rgba(29, 78, 216, 0.85)',
        borderRadius: 6,
      },
      {
        label: 'Resolved',
        data: summary?.byCategory?.map((item) => item.resolvedCount || 0) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 6,
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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Admin Workspace
            </span>
            <span className="text-sm text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-600">Dashboard Overview</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Executive Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Real-time municipal complaint metrics, Chart.js performance insights, and recent citizen reports.
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
            to="/admin/analytics"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-2xs transition hover:bg-blue-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics & Export</span>
          </Link>

          <Link
            to="/admin/complaints"
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
          title="Unable to Load Executive Dashboard"
          message="We couldn't fetch the latest municipal analytics and recent complaints. Click Retry below to reload."
          errorDetail={error}
          onRetry={loadDashboard}
          retrying={loading}
        />
      ) : !summary ? (
        <EmptyState
          title="No dashboard metrics available"
          description="Submit or seed complaints to populate executive charts and metrics."
        />
      ) : (
        <>
          {/* Primary Executive KPI Cards — 1-to-1 Mapping to System Sections */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Card 1: Total Complaints */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Complaints
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {summary.totalComplaints ?? 0}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-amber-700 font-semibold truncate">
                  {summary.pendingVerificationCount ?? 0} pending · {summary.inProgressCount ?? 0} active
                </span>
                <Link to="/admin/complaints" className="font-semibold text-blue-700 hover:text-blue-900 shrink-0 ml-1">
                  View →
                </Link>
              </div>
            </div>

            {/* Card 2: Resolved Reports */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Resolved Reports
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                  {summary.resolvedCount ?? 0}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                <span className="font-semibold text-emerald-700 truncate">
                  {summary.resolvedPercent ?? 0}% rate · avg {summary.averageResolutionDays ?? '—'}d
                </span>
                <Link to="/admin/analytics" className="font-semibold text-blue-700 hover:text-blue-900 shrink-0 ml-1">
                  Stats →
                </Link>
              </div>
            </div>

            {/* Card 3: Citizen Accounts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Citizen Accounts
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {summary.userStats?.citizens ?? 0}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-600 truncate">
                  <span className="font-semibold text-emerald-700">
                    {summary.userStats?.activeCitizens ?? 0} active
                  </span>
                  {' · '}
                  <span className="font-semibold text-rose-600">
                    {summary.userStats?.blockedCitizens ?? 0} blocked
                  </span>
                </span>
                <Link to="/admin/citizens" className="font-semibold text-blue-700 hover:text-blue-900 shrink-0 ml-1">
                  Users →
                </Link>
              </div>
            </div>

            {/* Card 4: Department Authorities */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Department Authorities
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-purple-700">
                  {summary.userStats?.authorities ?? 0}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-600 truncate">
                  <span className="font-semibold text-purple-800">
                    {summary.userStats?.activeAuthorities ?? summary.userStats?.authorities ?? 0} active
                  </span>
                  {' across '}
                  <span className="font-semibold text-slate-800">
                    {summary.userStats?.totalCategories ?? 7}
                  </span>{' '}
                  depts
                </span>
                <Link to="/admin/authorities" className="font-semibold text-blue-700 hover:text-blue-900 shrink-0 ml-1">
                  Depts →
                </Link>
              </div>
            </div>

            {/* Card 5: System Administrators */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    System Administrators
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.85} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {summary.userStats?.admins ?? 0}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-600 truncate">
                  <span className="font-semibold text-slate-800">
                    {summary.userStats?.activeAdmins ?? summary.userStats?.admins ?? 0} active
                  </span>
                  {' system '}
                  <span>admins</span>
                </span>
                <Link to="/admin/admins" className="font-semibold text-blue-700 hover:text-blue-900 shrink-0 ml-1">
                  Team →
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Workflow Stage Breakdown Strip (100% Complaint Status Accounting) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/40 px-4 py-3.5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  Pending Verification
                </p>
                <p className="mt-0.5 text-xs text-amber-700">New citizen reports awaiting triage</p>
              </div>
              <span className="text-2xl font-extrabold text-amber-800">
                {summary.pendingVerificationCount ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-blue-200/80 bg-blue-50/40 px-4 py-3.5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                  Verified & Assigned
                </p>
                <p className="mt-0.5 text-xs text-blue-700">
                  {summary.verifiedCount ?? 0} verified · {summary.assignedCount ?? 0} assigned
                </p>
              </div>
              <span className="text-2xl font-extrabold text-blue-800">
                {(summary.verifiedCount ?? 0) + (summary.assignedCount ?? 0)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-indigo-200/80 bg-indigo-50/40 px-4 py-3.5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
                  In Progress (Field Work)
                </p>
                <p className="mt-0.5 text-xs text-indigo-700">
                  {summary.inProgressCount ?? 0} total active across {summary.userStats?.totalCategories ?? 7} categories
                </p>
              </div>
              <span className="text-2xl font-extrabold text-indigo-800">
                {summary.inProgressOnlyCount ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-rose-200/80 bg-rose-50/40 px-4 py-3.5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                  Rejected / Closed
                </p>
                <p className="mt-0.5 text-xs text-rose-700">
                  {summary.rejectedCount ?? 0} rejected · {summary.unableToResolveCount ?? 0} unable to resolve
                </p>
              </div>
              <span className="text-2xl font-extrabold text-rose-800">
                {summary.closedCount ??
                  (summary.rejectedCount ?? 0) + (summary.unableToResolveCount ?? 0)}
              </span>
            </div>
          </div>

          {/* Chart.js Row: Category Bar Graph + Status Doughnut Graph */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Bar Chart: Complaints by Category */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-2">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Complaints by Category (Total vs. Resolved)
                  </h2>
                  <p className="text-sm text-slate-500">
                    Distribution of community issues across municipal service categories
                  </p>
                </div>
                <Link
                  to="/admin/analytics"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span>Full Analytics</span>
                  <span>→</span>
                </Link>
              </div>
              <div className="h-72">
                <Bar
                  data={categoryChartData}
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

            {/* Doughnut Chart: Complaints by Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">Status Distribution</h2>
                <p className="text-sm text-slate-500">Live workflow breakdown</p>
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

          {/* Recent Complaints Table & Department Performance */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Citizen Reports Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs lg:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Citizen Complaints</h2>
                  <p className="text-sm text-slate-500">
                    Latest submitted reports with quick View, Edit, and Delete actions
                  </p>
                </div>
                <Link
                  to="/admin/complaints"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span>Open Triage Queue</span>
                  <span>→</span>
                </Link>
              </div>

              {!summary.recentComplaints || summary.recentComplaints.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No complaints submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-3.5">Complaint</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.recentComplaints.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900 truncate max-w-[220px]">
                              {item.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              <span className="font-mono font-medium">{item.complaintId}</span>
                              {item.citizen ? ` · ${item.citizen.name}` : ''}
                            </p>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-700">{item.category}</td>
                          <td className="px-5 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
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

            {/* Department Workload Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Department Workload</h2>
                  <p className="text-sm text-slate-500">Assigned authority resolution progress</p>
                </div>
                <Link
                  to="/admin/authorities"
                  className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  Manage →
                </Link>
              </div>

              {!summary.byAuthority || summary.byAuthority.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No authority assignments yet.
                </div>
              ) : (
                <ul className="mt-5 space-y-4">
                  {summary.byAuthority.slice(0, 7).map((auth) => {
                    const pct =
                      auth.assigned > 0
                        ? Math.round((auth.resolved / auth.assigned) * 100)
                        : 0;
                    return (
                      <li key={auth.id || auth.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-800 truncate">{auth.name}</p>
                            {auth.category && (
                              <p className="text-xs text-slate-500 truncate">{auth.category}</p>
                            )}
                          </div>
                          <span className="text-slate-600 font-medium text-xs shrink-0">
                            {auth.resolved}/{auth.assigned} resolved ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-700 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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
