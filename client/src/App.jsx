import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AuthorityLayout from './components/AuthorityLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AuthorityRoute from './components/AuthorityRoute.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Profile from './pages/Profile.jsx';
import SubmitComplaint from './pages/SubmitComplaint.jsx';
import MyComplaints from './pages/MyComplaints.jsx';
import ComplaintDetail from './pages/ComplaintDetail.jsx';
import EditComplaint from './pages/EditComplaint.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx';
import AdminComplaints from './pages/admin/AdminComplaints.jsx';
import AdminCitizens from './pages/admin/AdminCitizens.jsx';
import AdminAuthorities from './pages/admin/AdminAuthorities.jsx';
import AdminAdmins from './pages/admin/AdminAdmins.jsx';
import AuthorityDashboard from './pages/authority/AuthorityDashboard.jsx';
import AuthorityAssigned from './pages/authority/AuthorityAssigned.jsx';
import AuthorityAnalytics from './pages/authority/AuthorityAnalytics.jsx';
import ErrorPage from './pages/ErrorPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Dedicated Admin Dashboard Layout — ONLY /admin/* pages are children of AdminLayout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="admins" element={<AdminAdmins />} />
        <Route path="citizens" element={<AdminCitizens />} />
        <Route path="users" element={<AdminCitizens />} />
        <Route path="authorities" element={<AdminAuthorities />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="*" element={<ErrorPage statusCode={404} title="Admin Page Not Found" />} />
      </Route>

      {/* Dedicated Authority Dashboard Layout — ONLY /assigned/* and /authority/* pages are children of AuthorityLayout */}
      <Route
        path="/assigned"
        element={
          <AuthorityRoute>
            <AuthorityLayout />
          </AuthorityRoute>
        }
      >
        <Route index element={<AuthorityDashboard />} />
        <Route path="complaints" element={<AuthorityAssigned />} />
        <Route path="analytics" element={<AuthorityAnalytics />} />
        <Route path="*" element={<ErrorPage statusCode={404} title="Authority Page Not Found" />} />
      </Route>

      <Route
        path="/authority"
        element={
          <AuthorityRoute>
            <AuthorityLayout />
          </AuthorityRoute>
        }
      >
        <Route index element={<AuthorityDashboard />} />
        <Route path="complaints" element={<AuthorityAssigned />} />
        <Route path="analytics" element={<AuthorityAnalytics />} />
        <Route path="*" element={<ErrorPage statusCode={404} title="Authority Page Not Found" />} />
      </Route>

      {/* Standard Public & Shared Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/new"
          element={
            <ProtectedRoute>
              <SubmitComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/:id"
          element={
            <ProtectedRoute>
              <ComplaintDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/:id/edit"
          element={
            <ProtectedRoute>
              <EditComplaint />
            </ProtectedRoute>
          }
        />
        <Route path="/error" element={<ErrorPage statusCode={500} />} />
        <Route path="*" element={<ErrorPage statusCode={404} />} />
      </Route>
    </Routes>
  );
}
