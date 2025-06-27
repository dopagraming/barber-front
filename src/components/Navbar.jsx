import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  Calendar,
  Settings,
  LogOut,
  Globe,
  BarChart3,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowUserMenu(false);
  };

  console.log(user);

  const isActive = (path) => location.pathname === path;

  const languages = [
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "he", name: "עברית", flag: "🇮🇱" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-primary-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-white font-bold text-xl gradient-text">
              BarberShop
            </span>
          </Link>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 text-gray-300 hover:text-white transition-colors flex items-center"
              >
                <Globe className="w-5 h-5 ml-1" />
                <span className="text-sm">
                  {languages.find((l) => l.code === language)?.flag}
                </span>
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-dark-800 rounded-lg shadow-xl border border-primary-500/20 py-2"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-right px-4 py-2 text-sm transition-colors flex items-center ${
                          language === lang.code
                            ? "text-primary-500 bg-primary-500/10"
                            : "text-gray-300 hover:text-white hover:bg-dark-700"
                        }`}
                      >
                        <span className="ml-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-white text-sm">{user.name}</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-xl border border-primary-500/20 py-2"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>{t("profile")}</span>
                      </Link>

                      {(user.role === "admin" || user.role === "barber") && (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>{t("dashboard")}</span>
                          </Link>

                          {user.role === "admin" && (
                            <Link
                              to="/dashboard/time-management"
                              className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Clock className="w-4 h-4" />
                              <span>{t("timeManagement")}</span>
                            </Link>
                          )}
                        </>
                      )}

                      <Link
                        to="/booking"
                        className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{t("booking")}</span>
                      </Link>

                      <hr className="my-2 border-dark-700" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("logout")}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-800 border-t border-primary-500/20"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Language Selection */}
              <div className="border-b border-dark-700 pb-4">
                <p className="text-gray-400 text-sm mb-2">
                  اللغة / Language / שפה
                </p>
                <div className="flex space-x-2 space-x-reverse">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        language === lang.code
                          ? "bg-primary-500 text-white"
                          : "bg-dark-700 text-gray-300 hover:text-white"
                      }`}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {user ? (
                <div className="pt-4 border-t border-dark-700 space-y-4">
                  <Link
                    to="/profile"
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("profile")}
                  </Link>
                  {(user.role === "admin" || user.role === "barber") && (
                    <>
                      <Link
                        to="/dashboard"
                        className="block text-gray-300 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {t("dashboard")}
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/dashboard/time-management"
                          className="block text-gray-300 hover:text-white transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {t("timeManagement")}
                        </Link>
                      )}
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block text-red-400 hover:text-red-300 transition-colors"
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-dark-700 space-y-4">
                  <Link
                    to="/login"
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("login")}
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("register")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
