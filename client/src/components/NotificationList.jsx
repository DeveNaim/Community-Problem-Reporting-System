import { Link } from 'react-router-dom';
import { NotificationSkeleton } from './Skeleton.jsx';

export default function NotificationList({ notifications, loading, onMarkRead }) {
  if (loading) {
    return <NotificationSkeleton count={3} />;
  }

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-gray-700">No notifications yet</p>
        <p className="mt-0.5 text-xs text-gray-400">
          You will receive real-time alerts when your complaints are reviewed or updated.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`px-4 py-3.5 transition-colors ${
            notification.isRead ? 'bg-white hover:bg-gray-50/60' : 'bg-blue-50/70 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
                {notification.complaint && (
                  <Link
                    to={`/complaints/${notification.complaint.id}`}
                    className="font-semibold text-blue-800 hover:underline"
                  >
                    View {notification.complaint.complaintId} →
                  </Link>
                )}
              </div>
            </div>
            {!notification.isRead && onMarkRead && (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="shrink-0 rounded bg-white px-2 py-1 text-xs font-medium text-blue-800 shadow-2xs hover:bg-blue-50 border border-blue-200"
              >
                Mark read
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
