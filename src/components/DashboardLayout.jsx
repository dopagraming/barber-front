import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Users,
  Scissors,
  UserCheck,
  Clock,
  Menu,
  X,
  Home,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowUserMenu(false);
  };

  const navigationItems = [
    {
      name: "نظرة عامة",
      href: "/dashboard",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      name: "المواعيد",
      href: "/dashboard/appointments",
      icon: Calendar,
      roles: ["admin", "barber"],
    },
    {
      name: "العملاء",
      href: "/dashboard/customers",
      icon: Users,
      roles: ["admin", "barber"],
    },
    {
      name: "الخدمات",
      href: "/dashboard/services",
      icon: Scissors,
      roles: ["admin"],
    },
    {
      name: "الحلاقين",
      href: "/dashboard/barbers",
      icon: UserCheck,
      roles: ["admin"],
    },
    {
      name: "التحليلات",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      name: "إدارة الأوقات",
      href: "/dashboard/time-management",
      icon: Clock,
      roles: ["admin"],
    },
  ];

  const filteredNavigation = navigationItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const isActive = (href) =>
    href === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween" }}
            className="fixed inset-y-0 right-0 z-50 w-64 bg-dark-800/95 backdrop-blur-md border-l border-primary-500/20 flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <Link
                to="/"
                className="flex items-center space-x-2 space-x-reverse"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="text-white font-bold text-lg gradient-text">
                  BarberShop
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all group relative ${
                      isActive(item.href)
                        ? "bg-primary-500 text-white"
                        : "text-gray-300 hover:bg-dark-700 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
                      />
                    )}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Right Side) */}
      <div className="hidden lg:flex lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-64 z-40 bg-dark-800/95 backdrop-blur-md border-l border-primary-500/20 flex-col">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="text-white font-bold text-lg gradient-text">
              BarberShop
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all group relative ${
                  isActive(item.href)
                    ? "bg-primary-500 text-white"
                    : "text-gray-300 hover:bg-dark-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
                  />
                )}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:mr-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-dark-800/95 backdrop-blur-md border-b border-primary-500/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-300 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-white font-semibold">لوحة التحكم</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
