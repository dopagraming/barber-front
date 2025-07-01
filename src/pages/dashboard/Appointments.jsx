import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Filter,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../lib/axios";

const DashboardAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    barber: "",
    service: "",
    date: "",
    time: "",
    notes: "",
    status: "confirmed",
  });

  useEffect(() => {
    fetchData();
  }, []);
  const refetchAppointment = async () => {
    const res = await api.get("api/appointments");
    setAppointments(appointmentsRes.data);
  };

  const fetchData = async () => {
    try {
      const [appointmentsRes, servicesRes, customersRes] = await Promise.all([
        api.get("api/appointments"),
        api.get("api/services"),
        api.get("api/customers"),
      ]);
      setAppointments(appointmentsRes.data);
      setServices(servicesRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await api.put(`api/appointments/${id}`, {
        status,
      });
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === id ? { ...apt, status } : apt))
      );
      refetchAppointment();
      toast.success("تم تحديث حالة الموعد بنجاح");
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("حدث خطأ في تحديث الموعد");
    }
  };

  const deleteAppointment = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموعد؟")) return;

    try {
      await api.delete(`api/appointments/${id}`);
      setAppointments((prev) => prev.filter((apt) => apt._id !== id));
      refetchAppointment();
      toast.success("تم حذف الموعد بنجاح");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("حدث خطأ في حذف الموعد");
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();

    try {
      const selectedService = services.find(
        (s) => s._id === newAppointment.service
      );
      const appointmentData = {
        ...newAppointment,
        totalPrice: selectedService?.price || 0,
      };

      const response = await api.post("api/appointments", appointmentData);
      setAppointments((prev) => [response.data, ...prev]);
      setShowAddModal(false);
      setNewAppointment({
        customerName: "",
        barber: "",
        service: "",
        date: "",
        time: "",
        notes: "",
        status: "confirmed",
      });
      fetchData();
      toast.success("تم إضافة الموعد بنجاح");
    } catch (error) {
      console.error("Error adding appointment:", error);
      toast.error("حدث خطأ في إضافة الموعد");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-400 bg-green-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "completed":
        return "text-blue-400 bg-blue-400/10";
      case "cancelled":
        return "text-red-400 bg-red-400/10";
      case "in-progress":
        return "text-purple-400 bg-purple-400/10";
      case "no-show":
        return "text-gray-400 bg-gray-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "مؤكد";
      case "pending":
        return "في الانتظار";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      case "in-progress":
        return "جاري التنفيذ";
      case "no-show":
        return "لم يحضر";
      default:
        return status;
    }
  };

  const filteredAppointments = appointments?.filter((appointment) => {
    // Handle filter matching
    let matchesFilter;
    if (filter === "all") {
      matchesFilter = true;
    } else if (filter === "today") {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Safely parse appointment date
        if (!appointment.date) {
          matchesFilter = false;
        } else {
          const appointmentDate = new Date(appointment.date);

          // Check if date is valid
          if (isNaN(appointmentDate.getTime())) {
            matchesFilter = false;
          } else {
            const appointmentDateStr = appointmentDate
              .toISOString()
              .split("T")[0];
            matchesFilter = todayStr === appointmentDateStr;
          }
        }
      } catch (e) {
        console.error("Error processing date:", e);
        matchesFilter = false;
      }
    } else {
      matchesFilter = appointment.status === filter;
    }

    // Handle search matching
    const matchesSearch =
      appointment.customer?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.service?.nameAr?.includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              إدارة المواعيد
            </h1>
            <p className="text-gray-400">عرض وإدارة جميع مواعيد الصالون</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة موعد جديد
          </button>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-800/50 rounded-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في المواعيد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">جميع المواعيد</option>
                <option value="today">اليوم</option>
                <option value="cancelled">ملغي</option>
                <option value="confirmed">مؤكد</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments?.length > 0 ? (
            filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-800/50 rounded-lg p-6 border border-dark-600 hover:border-primary-500/50 transition-all mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {appointment.customer?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {appointment.customerName || appointment.customer?.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {appointment.service?.nameAr} -{" "}
                        {appointment.barber?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                    <div className="text-primary-500 font-bold">
                      {appointment.totalPrice} شيكل
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-400">
                    <Calendar className="w-4 h-4 ml-2" />
                    {format(new Date(appointment.date), "EEEE، d MMMM yyyy", {
                      locale: ar,
                    })}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 ml-2" />
                    {appointment.time}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Phone className="w-4 h-4 ml-2" />
                    {appointment.customer?.phone}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Mail className="w-4 h-4 ml-2" />
                    {appointment.customer?.email}
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mb-4 p-3 bg-dark-700/50 rounded-lg">
                    <p className="text-gray-300 text-sm">{appointment.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      updateAppointmentStatus(appointment._id, "cancelled")
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center"
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    إلغاء
                  </button>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-dark-700 transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAppointment(appointment._id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-10">لا توجد مواعيد</p>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                إضافة موعد جديد
              </h2>

              <form onSubmit={handleAddAppointment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      أسم العميل *
                    </label>
                    <input
                      value={newAppointment.customerName}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          customerName: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      الخدمة *
                    </label>
                    <select
                      value={newAppointment.service}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          service: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">اختر الخدمة</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.nameAr} - {service.price} شيكل
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      التاريخ *
                    </label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          date: e.target.value,
                        })
                      }
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      الوقت *
                    </label>
                    <select
                      value={newAppointment.time}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          time: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">اختر الوقت</option>
                      {[
                        "09:00",
                        "09:30",
                        "10:00",
                        "10:30",
                        "11:00",
                        "11:30",
                        "12:00",
                        "12:30",
                        "14:00",
                        "14:30",
                        "15:00",
                        "15:30",
                        "16:00",
                        "16:30",
                        "17:00",
                        "17:30",
                        "18:00",
                        "18:30",
                        "19:00",
                        "19:30",
                        "20:00",
                        "20:30",
                        "21:00",
                      ].map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewAppointment({
                        customerName: "",
                        service: "",
                        date: "",
                        time: "",
                        notes: "",
                        status: "confirmed",
                      });
                    }}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    إضافة الموعد
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAppointments;
