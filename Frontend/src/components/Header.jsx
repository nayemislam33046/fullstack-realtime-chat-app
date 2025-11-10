import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { isOpen, setIsOpen } = useChat();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dark mode 
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow relative z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
            title="Toggle menu"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <Link
            to="/"
            className="text-xl font-bold text-gray-800 dark:text-white"
          >
            Messenger
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* User avatar + popup */}
          {user && (
            <div className="relative" ref={menuRef}>
              <img
                src={
                  user?.avatar?`https://chat-app-backend-xz9q.onrender.com/api/proxy-image/${user?.avatar}`:`https://ui-avatars.com/api/?name=${user?.name}&background=random`
                }
                alt={user?.name}
                className="h-8 w-8 rounded-full cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 text-center text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                    {user?.name}
                  </div>
                  <Link to={'/profile'} className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;