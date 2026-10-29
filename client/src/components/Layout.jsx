import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const FULL_WIDTH_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

export default function Layout() {
  const location = useLocation();
  const isFullWidth = FULL_WIDTH_ROUTES.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Header />
      <main className={isFullWidth ? 'flex-1 w-full' : 'mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
