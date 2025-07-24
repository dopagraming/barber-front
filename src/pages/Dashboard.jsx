import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Calendar, DollarSign, TrendingUp, Star } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  // if you wanna to fetch Analytics from database use this function fetchAnalytics

  // useEffect(() => {
  //   fetchAnalytics();
  // }, []);

  // const fetchAnalytics = async () => {
  //   try {
  //     const response = await api.get("api/analytics/dashboard");
  //     setAnalytics(response.data);
  //   } catch (error) {
  //     console.error("Error fetching analytics:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // if (loading) return <LoadingSpinner />;

  const stats = [
    {
      title: t("totalCustomers"),
      value: analytics?.totalCustomers || 0,
      icon: <Users className="w-8 h-8" />,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: t("todayAppointments"),
      value: analytics?.todayAppointments || 0,
      icon: <Calendar className="w-8 h-8" />,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: t("monthlyRevenue"),
      value: `${analytics?.monthlyRevenue || 0} ${t("currency")}`,
      icon: <DollarSign className="w-8 h-8" />,
      color: "bg-primary-500",
      change: "+15%",
    },
    {
      title: t("totalAppointments"),
      value: analytics?.totalAppointments || 0,
      icon: <TrendingUp className="w-8 h-8" />,
      color: "bg-purple-500",
      change: "+5%",
    },
  ];

  // const serviceData =
  //   analytics?.popularServices?.map((service, index) => ({
  //     name: service.service.nameAr,
  //     value: service.count,
  //     color: ["#f59332", "#e35d05", "#bc4508", "#95370e", "#782f0f"][index],
  //   })) || [];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("dashboard")}
          </h1>
          <p className="text-gray-400">
            {t("welcome")} {user?.name}، {t("salonOverview")}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-dark-800/50 rounded-lg p-6 border border-primary-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
                <span className="text-green-400 text-sm font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-dark-800/50 rounded-lg p-6 border border-primary-500/20"
        >
          <h3 className="text-white font-semibold text-lg mb-6">
            {t("quickActions")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/dashboard/appointments"
              className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-lg transition-all text-center group"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium">{t("manageAppointments")}</h4>
              <p className="text-sm opacity-90">
                {t("viewManageAllAppointments")}
              </p>
            </Link>

            <Link
              to="/dashboard/customers"
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-all text-center group"
            >
              <Users className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium">{t("manageCustomers")}</h4>
              <p className="text-sm opacity-90">{t("viewCustomerInfo")}</p>
            </Link>

            <Link
              to="/dashboard/services"
              className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-all text-center group"
            >
              <Star className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium">{t("manageServices")}</h4>
              <p className="text-sm opacity-90">{t("addEditServices")}</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
