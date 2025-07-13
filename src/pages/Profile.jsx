import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Calendar,
  Clock,
  Star,
  Edit,
  Phone,
  Mail,
  Save,
  X,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  Award,
  HomeIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ar, enUS, he } from "date-fns/locale";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";

const Profile = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { user, setUser } = useAuth();
  const { t, language } = useLanguage();

  const getDateLocale = () => {
    switch (language) {
      case "ar":
        return ar;
      case "he":
        return he;
      case "en":
        return enUS;
      default:
        return ar;
    }
  };

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    preferences: user?.preferences || {
      language: "ar",
      notifications: {
        email: true,
        sms: true,
      },
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get("api/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("api/appointments/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("api/users/profile", profileData);
      setUser(response.data);
      setEditMode(false);
      toast.success(t("operationSuccessful"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("operationFailed"));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("passwordsNotMatch"));
      return;
    }

    try {
      await api.put("api/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      toast.success(t("passwordChangedSuccess"));
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || t("passwordChangeError"));
    }
  };

  const handleAppointmentUpdate = async (appointmentId, updates) => {
    let app = appointments.find((a) => a._id == appointmentId);
    if (!app) {
      toast.error("Appointment not found.");
      return;
    }
    if (user.role === "customer") {
      const appointmentDate = new Date(app.date);
      const today = new Date();

      appointmentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const msInDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.floor((appointmentDate - today) / msInDay);

      if (diffDays < 1) {
        toast.error(t("cancelAppError"));
        return;
      }
    }

    try {
      const response = await api.put(
        `api/appointments/${appointmentId}`,
        updates
      );
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === appointmentId ? response.data : apt))
      );
      toast.success(t("appointmentUpdatedSuccess"));
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(t("appointmentUpdateError"));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen py-20 relative`}>
      <div
        className={
          (editMode || showPasswordForm) &&
          "absolute w-full h-full left-0 top-0 bg-dark-800/80"
        }
      ></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-300 hover:text-white transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <HomeIcon className="w-4 h-4" />
          <span>{t("mainPage")}</span>
        </Link>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-dark-800/50 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center space-x-6 space-x-reverse m-2">
              <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {user?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user?.name}
                </h1>
                <div className="flex items-center space-x-4 space-x-reverse text-gray-400 flex-wrap">
                  {user.userName && (
                    <div className="flex items-center">@{user?.userName}</div>
                  )}
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 ml-1" />
                    {user?.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 ml-1" />
                    {user?.phone}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => setEditMode(!editMode)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
              >
                <Edit className="w-4 h-4 ml-2" />
                {editMode ? t("cancel") : t("editProfile")}
              </button>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="bg-dark-700 hover:bg-dark-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                {t("changePassword")}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        {editMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-800 rounded-lg p-6 mb-8 w-[80%] "
          >
            <h3 className="text-white font-semibold text-lg mb-6">
              {t("editPersonalProfile")}
            </h3>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t("name")}
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {t("saveChanges")}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Change Password Form */}
        {showPasswordForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="absolute left-1/2 top -translate-x-1/2 -translate-y-1/2 bg-dark-800 rounded-lg p-6 mb-8 w-[80%]"
          >
            <h3 className="text-white font-semibold text-lg mb-6">
              {t("changePassword")}
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  {t("currentPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 pl-12"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 pl-12"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  {t("confirmNewPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 pl-12"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-4 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all"
                >
                  {t("changePassword")}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 space-x-reverse mb-8">
          <button className="px-6 py-3 rounded-lg font-medium transition-all bg-primary-500 text-white">
            <Calendar className="w-4 h-4 inline ml-2" />
            {t("myAppointments")}
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {t("upcomingAppointments")}
            </h2>

            {appointments.filter(
              (apt) => apt.status !== "completed" && apt.status !== "cancelled"
            ).length === 0 ? (
              <div className="bg-dark-800/50 rounded-lg p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">
                  {t("noUpcomingAppointments")}
                </h3>
                <p className="text-gray-400 mb-6">{t("bookNowEnjoyService")}</p>
                <Link
                  to="/booking"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all inline-block"
                >
                  {t("bookNewAppointment")}
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {appointments
                  .filter(
                    (apt) =>
                      apt.status !== "completed" && apt.status !== "cancelled"
                  )
                  .map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-dark-800/50 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary-500" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              {appointment.service?.nameAr}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <button
                            onClick={() =>
                              handleAppointmentUpdate(appointment._id, {
                                status: "cancelled",
                              })
                            }
                            className="text-red-400 hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-400/10 transition-all text-sm"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-400">
                          <Calendar className="w-4 h-4 ml-2" />
                          {format(
                            new Date(appointment.date),
                            "EEEE، d MMMM yyyy",
                            { locale: getDateLocale() }
                          )}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Clock className="w-4 h-4 ml-2" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center text-primary-500 font-semibold">
                          {appointment.totalPrice} {t("currency")}
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-dark-700/50 rounded-lg">
                          <p className="text-gray-300 text-sm">
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
