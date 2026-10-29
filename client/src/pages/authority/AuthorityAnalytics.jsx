import { useCallback, useEffect, useState } from 'react';
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
import { apiFetch, downloadAuthenticatedFile } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  extractAuthorityEmailToken,
  getAuthorityCategoryFromUser,
} from '../../utils/authorityCategory.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';

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

const STATUS_COLOR_MAP = {
  'Pending Verification': { bg: 'rgba(245, 158, 11, 0.85)', border: 'rgb(217, 119, 6)' },
  Verified: { bg: 'rgba(59, 130, 246, 0.85)', border: 'rgb(37, 99, 235)' },
  Assigned: { bg: 'rgba(99, 102, 241, 0.85)', border: 'rgb(79, 70, 229)' },
  'In Progress': { bg: 'rgba(139, 92, 246, 0.85)', border: 'rgb(124, 58, 237)' },
  Resolved: { bg: 'rgba(16, 185, 129, 0.85)', border: 'rgb(5, 150, 105)' },
  Rejected: { bg: 'rgba(244, 63, 94, 0.85)', border: 'rgb(225, 29, 72)' },
  'Unable to Resolve': { bg: 'rgba(100, 116, 139, 0.85)', border: 'rgb(71, 85, 105)' },
};

export default function AuthorityAnalytics() {
  const { user } = useAuth();
  const authorityCategory = getAuthorityCategoryFromUser(user);
  const emailToken = extractAuthorityEmailToken(user?.email);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateFilter, setDateFilter] = useState({ dateFrom: '', dateTo: '' });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateFilter.dateFrom) params.set('dateFrom', dateFilter.dateFrom);
      if (dateFilter.dateTo) params.set('dateTo', dateFilter.dateTo);
      const qs = params.toString();
      const data = await apiFetch(qs ? `/api/analytics/summary?${qs}` : '/api/analytics/summary');
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || 'Failed to load department analytics.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  async function handleExportCsv() {
    setExporting(true);
    setExportError(null);
    setExportSuccess(null);
    try {
      const params = new URLSearchParams();
      if (dateFilter.dateFrom) params.set('dateFrom', dateFilter.dateFrom);
      if (dateFilter.dateTo) params.set('dateTo', dateFilter.dateTo);
      const qs = params.toString();
      const path = qs ? `/api/analytics/export?${qs}` : '/api/analytics/export';
      const slug = emailToken || 'department';
      const filename = `cprs-${slug}-report-${new Date().toISOString().slice(0, 10)}.csv`;
      await downloadAuthenticatedFile(path, filename);
      setExportSuccess(`Successfully exported ${filename}`);
    } catch (err) {
      setExportError(err.message || 'Failed to export CSV report.');
    } finally {
      setExporting(false);
    }
  }

  function applyQuickRange(days) {
    if (!days) {
      setDateFilter({ dateFrom: '', dateTo: '' });
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateFilter({
      dateFrom: start.toISOString().slice(0, 10),
      dateTo: end.toISOString().slice(0, 10),
    });
  }

  const trendChartData = {
    labels: summary?.monthlyTrend?.map((m) => m.label) || [],
    datasets: [
      {
        label: 'Reported Complaints',
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
        label: 'Resolved Complaints',
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
    labels: summary?.byStatus?.map((s) => s.status) || [],
    datasets: [
      {
        data: summary?.byStatus?.map((s) => s.count) || [],
        backgroundColor:
          summary?.byStatus?.map(
            (s) => STATUS_COLOR_MAP[s.status]?.bg || 'rgba(107, 114, 128, 0.8)'
          ) || [],
        borderColor:
          summary?.byStatus?.map(
            (s) => STATUS_COLOR_MAP[s.status]?.border || 'rgb(75, 85, 99)'
          ) || [],
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Authority Workspace
          </span>
          <span className="text-sm text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-600">Analytics & Export</span>
          {authorityCategory && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
              Locked Category: {authorityCategory}
            </span>
          )}
        </div>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {authorityCategory ? `${authorityCategory} Analytics & Export` : 'Department Analytics & Export'}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-3xl">
          Chart.js resolution analytics and CSV report export automatically scoped to your department category (<code className="font-mono text-xs text-blue-700">.{emailToken || 'authority'}@</code>).
        </p>
      </div>

      {/* Filter & Export Control Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
                Quick Range:
              </span>
              {[
                { label: 'All Time', days: null },
                { label: 'Last 7 Days', days: 7 },
                { label: 'Last 30 Days', days: 30 },
                { label: 'Last 90 Days', days: 90 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyQuickRange(preset.days)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-3.5">
              {/* Disabled Category Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Department Category (Locked)
                </label>
                <select
                  value={authorityCategory || ''}
                  disabled
                  className="rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-600 cursor-not-allowed select-none"
                >
                  <option value={authorityCategory || ''}>
                    {authorityCategory || 'Assigned Category'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFilter.dateFrom}
                  onChange={(e) => setDateFilter((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateFilter.dateTo}
                  onChange={(e) => setDateFilter((prev) => ({ ...prev, dateTo: e.target.value }))}
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              {(dateFilter.dateFrom || dateFilter.dateTo) && (
                <button
                  type="button"
                  onClick={() => setDateFilter({ dateFrom: '', dateTo: '' })}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadAnalytics}
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
              onClick={handleExportCsv}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-600 disabled:opacity-60 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{exporting ? 'Generating CSV…' : 'Export Department CSV'}</span>
            </button>
          </div>
        </div>

        {exportError && (
          <div className="mt-4">
            <ErrorState
              variant="banner"
              title="Department CSV Export Failed"
              errorDetail={exportError}
              onRetry={handleExportCsv}
              retrying={exporting}
              retryLabel="Retry Export"
              onDismiss={() => setExportError(null)}
            />
          </div>
        )}
        {exportSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {exportSuccess}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to Load Department Analytics"
          message="We couldn't fetch the Chart.js analytics summary for your department. Click Retry below to reload."
          errorDetail={error}
          onRetry={loadAnalytics}
          retrying={loading}
        />
      ) : !summary || summary.totalComplaints === 0 ? (
        <EmptyState
          title="No department analytics for this period"
          description="No complaints were found for your department matching the selected date filter."
          actionLabel="Reset Date Filter"
          onAction={() => setDateFilter({ dateFrom: '', dateTo: '' })}
        />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total {authorityCategory}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{summary.totalComplaints}</p>
              <p className="mt-1.5 text-xs text-slate-500">
                {summary.pendingVerificationCount ?? 0} pending ·{' '}
                {summary.closedCount ??
                  (summary.rejectedCount ?? 0) + (summary.unableToResolveCount ?? 0)}{' '}
                closed
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Resolved ({summary.resolvedPercent}%)
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                {summary.resolvedCount ?? 0}
              </p>
              <p className="mt-1.5 text-xs text-emerald-700">Completed field resolutions</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
                Active / In Progress
              </p>
              <p className="mt-2 text-3xl font-extrabold text-indigo-700">
                {summary.inProgressCount ?? 0}
              </p>
              <p className="mt-1.5 text-xs text-indigo-700">
                {summary.verifiedCount ?? 0} verified · {summary.assignedCount ?? 0} assigned ·{' '}
                {summary.inProgressOnlyCount ?? 0} in progress
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                Avg. Resolution Days
              </p>
              <p className="mt-2 text-3xl font-extrabold text-blue-900">
                {summary.averageResolutionDays !== null && summary.averageResolutionDays !== undefined
                  ? `${summary.averageResolutionDays}d`
                  : '—'}
              </p>
              <p className="mt-1.5 text-xs text-blue-700">Department turnaround time</p>
            </div>
          </div>

          {/* Chart.js Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-2">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Monthly Volume vs. Resolutions ({authorityCategory})
                </h2>
                <p className="text-sm text-slate-500">
                  6-month historical trajectory of reported and resolved issues in your department
                </p>
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
                <h2 className="text-lg font-bold text-slate-900">Status Breakdown</h2>
                <p className="text-sm text-slate-500">Workflow stage distribution</p>
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

          {/* Status Summary Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">
                {authorityCategory || 'Department'} Workflow Status Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Complaints</th>
                    <th className="px-6 py-3.5 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.byStatus.map((item) => {
                    const share =
                      summary.totalComplaints > 0
                        ? Math.round((item.count / summary.totalComplaints) * 100)
                        : 0;
                    return (
                      <tr key={item.status} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                          {item.count}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-600">
                          {share}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

