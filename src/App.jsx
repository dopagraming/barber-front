import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Components
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import SkipToContent from "./components/SkipToContent";
import SEOHead from "./components/SEOHead";

// Pages
import Home from "./pages/Home";
import BookingSystem from "./pages/BookingSystem";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPasswordPage";
import ResetPassword from "./pages/ResetPasswordPage";

// Dashboard
import Dashboard from "./pages/Dashboard";
import DashboardAppointments from "./pages/dashboard/Appointments";
import DashboardServices from "./pages/dashboard/Services";
import DashboardCustomers from "./pages/dashboard/Customers";
import DashboardBarbers from "./pages/dashboard/Barbers";
import DashboardAnalytics from "./pages/dashboard/Analytics";
import TimeManagement from "./pages/dashboard/TimeManagement";
import Calender from "./pages/dashboard/Calender";
import Notifications from "./pages/dashboard/Notifications";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/login" />;

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

// Dashboard Route Component
const DashboardRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/login" />;

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppContent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { loading } = useAuth();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Check for updates every hour
      const updateInterval = setInterval(() => {
        navigator.serviceWorker.ready.then((reg) => {
          reg.update().catch((err) => console.log("Update check failed:", err));
        });
      }, 60 * 60 * 1000);

      // Listen for updates
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
              toast(
                (t) => (
                  <div className="flex flex-col gap-2">
                    <span>New version available!</span>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          window.location.reload();
                          toast.dismiss(t.id);
                        }}
                        className="px-3 py-1 bg-primary-500 rounded-md text-sm"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setUpdateAvailable(false);
                          toast.dismiss(t.id);
                        }}
                        className="px-3 py-1 bg-gray-600 rounded-md text-sm"
                      >
                        Later
                      </button>
                    </div>
                  </div>
                ),
                {
                  duration: 10000,
                  position: "bottom-center",
                  style: {
                    background: "#1e293b",
                    color: "#fff",
                    border: "1px solid #f59332",
                  },
                }
              );
            }
          });
        });
      });

      return () => clearInterval(updateInterval);
    }
    console.log(__APP_VERSION__);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative">
      {updateAvailable && (
        <button
          onClick={() => window.location.reload()}
          className="fixed bottom-4 right-4 z-50 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
        >
          <span>Update Available</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      <SkipToContent />
      <Routes>
        {/* Public Routes with Navbar */}
        <Route
          path="/"
          element={
            <>
              <SEOHead />
              <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
              <main id="main-content" className="pt-16">
                <Home isOpen={isOpen} />
              </main>
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <SEOHead
                title="تسجيل الدخول - Ali Barber Shop"
                description="سجل دخولك للوصول إلى حسابك وإدارة مواعيدك"
              />
              <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
              <main id="main-content" className="pt-16">
                <Login isOpen={isOpen} />
              </main>
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <SEOHead
                title="إنشاء حساب جديد - Ali Barber Shop"
                description="انضم إلينا واحجز موعدك الأول في أفضل صالون حلاقة"
              />
              <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
              <main id="main-content" className="pt-16">
                <Register isOpen={isOpen} />
              </main>
            </>
          }
        />

        {/* Protected Routes with Navbar */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <SEOHead
                title="حجز موعد - Ali Barber Shop"
                description="احجز موعدك الآن واختر الخدمة والوقت المناسب لك"
              />
              <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
              <main id="main-content" className="pt-16">
                <BookingSystem isOpen={isOpen} />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <SEOHead
                title="الملف الشخصي - Ali Barber Shop"
                description="إدارة ملفك الشخصي ومواعيدك وتاريخ زياراتك"
              />
              <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
              <main id="main-content" className="pt-16">
                <Profile isOpen={isOpen} />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forget-password"
          element={
            <>
              <SEOHead
                title="نسيت كملة المرور - Ali Barber Shop"
                description="غير كلمة المرور"
              />
              <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
              <main id="main-content" className="pt-16">
                <ForgotPassword />
              </main>
            </>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <>
              <SEOHead
                title="نسيت كملة المرور - Ali Barber Shop"
                description="غير كلمة المرور"
              />
              <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
              <main id="main-content" className="pt-16">
                <ResetPassword />
              </main>
            </>
          }
        />

        {/* Dashboard Routes with Sidebar Layout */}
        <Route
          path="/dashboard"
          element={
            <DashboardRoute requiredRole="admin">
              <SEOHead
                title="لوحة التحكم - Ali Barber Shop"
                description="إدارة الصالون ومتابعة الأداء والإحصائيات"
              />
              <main id="main-content">
                <Dashboard />
              </main>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/appointments"
          element={
            <DashboardRoute>
              <SEOHead
                title="إدارة المواعيد - Ali Barber Shop"
                description="عرض وإدارة جميع مواعيد الصالون"
              />
              <main id="main-content">
                <DashboardAppointments />
              </main>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/services"
          element={
            <DashboardRoute requiredRole="admin">
              <SEOHead
                title="إدارة الخدمات - Ali Barber Shop"
                description="إضافة وتعديل خدمات الصالون"
              />
              <main id="main-content">
                <DashboardServices />
              </main>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/customers"
          element={
            <DashboardRoute>
              <SEOHead
                title="إدارة العملاء - Ali Barber Shop"
                description="عرض ومتابعة معلومات العملاء"
              />
              <main id="main-content">
                <DashboardCustomers />
              </main>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/barbers"
          element={
            <DashboardRoute requiredRole="admin">
              <SEOHead
                title="إدارة الحلاقين - Ali Barber Shop"
                description="إضافة ومتابعة فريق الحلاقين"
              />
              <main id="main-content">
                <DashboardBarbers />
              </main>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <DashboardRoute requiredRole="admin">
              <SEOHead
                title="التحليلات والتقارير - Ali Barber Shop"
                description="نظرة شاملة على أداء الصالون والإحصائيات"
              />
              <main id="main-content">
                <DashboardAnalytics />
              </main>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/time-management"
          element={
            <DashboardRoute requiredRole="admin">
              <SEOHead
                title="إدارة الأوقات - Ali Barber Shop"
                description="إعدادات أوقات العمل والمواعيد المتاحة"
              />
              <main id="main-content">
                <TimeManagement />
              </main>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/calender"
          element={
            <DashboardRoute requiredRole="admin">
              <SEOHead
                title="إدارة الأوقات - Ali Barber Shop"
                description="إعدادات أوقات العمل والمواعيد المتاحة"
              />
              <main id="main-content">
                <Calender />
              </main>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <DashboardRoute requiredRole="admin">
              <SEOHead title="الإشعارات - Ali Barber Shop" />
              <main id="main-content">
                <Notifications />
              </main>
            </DashboardRoute>
          }
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #f59332",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <AuthProvider>
            <LanguageProvider>
              <AppContent />
            </LanguageProvider>
          </AuthProvider>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
