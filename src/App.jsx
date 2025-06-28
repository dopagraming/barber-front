import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
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

// Dashboard
import Dashboard from "./pages/Dashboard";
import DashboardAppointments from "./pages/dashboard/Appointments";
import DashboardServices from "./pages/dashboard/Services";
import DashboardCustomers from "./pages/dashboard/Customers";
import DashboardBarbers from "./pages/dashboard/Barbers";
import DashboardAnalytics from "./pages/dashboard/Analytics";
import TimeManagement from "./pages/dashboard/TimeManagement";

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
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <SkipToContent />

      <Routes>
        {/* Public Routes with Navbar */}
        <Route
          path="/"
          element={
            <>
              <SEOHead />
              <Navbar />
              <main id="main-content" className="pt-16">
                <Home />
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
              <Navbar />
              <main id="main-content" className="pt-16">
                <Login />
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
              <Navbar />
              <main id="main-content" className="pt-16">
                <Register />
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
              <Navbar />
              <main id="main-content" className="pt-16">
                <BookingSystem />
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
              <Navbar />
              <main id="main-content" className="pt-16">
                <Profile />
              </main>
            </ProtectedRoute>
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
