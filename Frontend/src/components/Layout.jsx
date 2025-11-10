import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { user } = useAuth();
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {user && <Header />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;