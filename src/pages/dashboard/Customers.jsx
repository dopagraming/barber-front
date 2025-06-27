import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Eye,
  MoreVertical,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../lib/axios";

const DashboardCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [customerToBlock, setCustomerToBlock] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  useEffect(() => {
    fetchCustomers();
    fetchAppointments();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("api/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("حدث خطأ في تحميل العملاء");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get("api/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const getCustomerAppointments = (customerId) => {
    return appointments.filter((apt) => apt.customer?._id === customerId);
  };

  const getCustomerStats = (customerId) => {
    const customerAppointments = getCustomerAppointments(customerId);
    const totalAppointments = customerAppointments.length;
    const completedAppointments = customerAppointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const totalSpent = customerAppointments
      .filter((apt) => apt.status === "completed")
      .reduce((sum, apt) => sum + apt.totalPrice, 0);

    return {
      totalAppointments,
      completedAppointments,
      totalSpent,
      lastVisit:
        customerAppointments.length > 0
          ? new Date(
              Math.max(...customerAppointments.map((apt) => new Date(apt.date)))
            )
          : null,
    };
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("api/auth/register/", newUserData);
      toast.success("تم إضافة العميل الجديد بنجاح");
      setShowAddUserModal(false);
      setNewUserData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "customer",
      });
      // TODO: Refresh customer list here (call your fetch function)
    } catch (error) {
      console.error("Error adding new user:", error);
      toast.error("حدث خطأ أثناء إضافة العميل");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      await api.delete(`api/customers/${customerToDelete._id}`);
      setCustomers((prev) =>
        prev.filter((c) => c._id !== customerToDelete._id)
      );
      toast.success("تم حذف العميل بنجاح");
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("حدث خطأ في حذف العميل");
    }
  };

  const handleBlockCustomer = async () => {
    if (!customerToBlock) return;

    try {
      const response = await api.patch(
        `api/customers/${customerToBlock._id}/block`,
        {
          isActive: !customerToBlock.isActive,
        }
      );

      setCustomers((prev) =>
        prev.map((c) => (c._id === customerToBlock._id ? response.data : c))
      );

      const action = customerToBlock.isActive ? "حظر" : "إلغاء حظر";
      toast.success(`تم ${action} العميل بنجاح`);
      setShowBlockModal(false);
      setCustomerToBlock(null);
    } catch (error) {
      console.error("Error blocking customer:", error);
      toast.error("حدث خطأ في تحديث حالة العميل");
    }
  };

  const openDeleteModal = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const openBlockModal = (customer) => {
    setCustomerToBlock(customer);
    setShowBlockModal(true);
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm)
    );
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">إدارة العملاء</h1>
          <p className="text-gray-400">عرض ومتابعة معلومات العملاء</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-800/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي العملاء</p>
                <p className="text-white text-2xl font-bold">
                  {customers.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-dark-800/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">عملاء نشطين</p>
                <p className="text-white text-2xl font-bold">
                  {customers.filter((c) => c.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-dark-800/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">عملاء محظورين</p>
                <p className="text-white text-2xl font-bold">
                  {customers.filter((c) => !c.isActive).length}
                </p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-dark-800/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">متوسط الزيارات</p>
                <p className="text-white text-2xl font-bold">
                  {customers.length > 0
                    ? (appointments.length / customers.length).toFixed(1)
                    : 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-800/50 rounded-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="mb-6 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة عميل جديد
            </button>
          </div>
        </motion.div>

        {showAddUserModal && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={() => setShowAddUserModal(false)}
          >
            <div
              className="bg-dark-700 p-6 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-white text-xl font-bold mb-4">
                إضافة عميل جديد
              </h2>
              <form onSubmit={handleAddUserSubmit} className="space-y-4">
                <input
                  name="name"
                  value={newUserData.name}
                  onChange={handleNewUserChange}
                  placeholder="الاسم الأول"
                  required
                  className="w-full px-3 py-2 rounded bg-dark-600 text-white border border-dark-500 focus:outline-none focus:border-primary-500"
                />
                <input
                  name="lastName"
                  value={newUserData.lastName}
                  onChange={handleNewUserChange}
                  placeholder="اسم العائلة"
                  required
                  className="w-full px-3 py-2 rounded bg-dark-600 text-white border border-dark-500 focus:outline-none focus:border-primary-500"
                />
                <input
                  name="email"
                  type="email"
                  value={newUserData.email}
                  onChange={handleNewUserChange}
                  placeholder="البريد الإلكتروني"
                  required
                  className="w-full px-3 py-2 rounded bg-dark-600 text-white border border-dark-500 focus:outline-none focus:border-primary-500"
                />
                <input
                  name="phone"
                  value={newUserData.phone}
                  onChange={handleNewUserChange}
                  placeholder="رقم الهاتف"
                  required
                  className="w-full px-3 py-2 rounded bg-dark-600 text-white border border-dark-500 focus:outline-none focus:border-primary-500"
                />
                <input
                  name="password"
                  type="password"
                  value={newUserData.password}
                  onChange={handleNewUserChange}
                  placeholder="كلمة المرور"
                  required
                  className="w-full px-3 py-2 rounded bg-dark-600 text-white border border-dark-500 focus:outline-none focus:border-primary-500"
                />
                {/* Optional: role field hidden or selectable */}
                <input type="hidden" name="role" value={newUserData.role} />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-dark-800/50 rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-4 text-right text-white font-semibold">
                    العميل
                  </th>
                  <th className="px-6 py-4 text-right text-white font-semibold">
                    معلومات التواصل
                  </th>
                  <th className="px-6 py-4 text-right text-white font-semibold">
                    إحصائيات
                  </th>
                  <th className="px-6 py-4 text-right text-white font-semibold">
                    آخر زيارة
                  </th>
                  <th className="px-6 py-4 text-right text-white font-semibold">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-white font-semibold">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {filteredCustomers.map((customer, index) => {
                  const stats = getCustomerStats(customer._id);
                  return (
                    <motion.tr
                      key={customer._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-dark-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {customer.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {customer.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              انضم في{" "}
                              {format(
                                new Date(customer.createdAt),
                                "MMM yyyy",
                                { locale: ar }
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-300 text-sm">
                            <Mail className="w-4 h-4 ml-2" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-gray-300 text-sm">
                            <Phone className="w-4 h-4 ml-2" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <p className="text-white">
                            {stats.totalAppointments} موعد
                          </p>
                          <p className="text-gray-400">
                            {stats.totalSpent} ريال إجمالي
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300 text-sm">
                          {stats.lastVisit
                            ? format(stats.lastVisit, "dd/MM/yyyy", {
                                locale: ar,
                              })
                            : "لا توجد زيارات"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            customer.isActive
                              ? "bg-green-400/10 text-green-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {customer.isActive ? "نشط" : "محظور"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button
                            onClick={() => viewCustomerDetails(customer)}
                            className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-400/10 transition-all"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openBlockModal(customer)}
                            className={`p-2 rounded-lg transition-all ${
                              customer.isActive
                                ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                                : "text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            }`}
                            title={
                              customer.isActive
                                ? "حظر العميل"
                                : "إلغاء حظر العميل"
                            }
                          >
                            {customer.isActive ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all"
                            title="حذف العميل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                لا يوجد عملاء
              </h3>
              <p className="text-gray-400">
                لا يوجد عملاء يطابقون معايير البحث
              </p>
            </div>
          )}
        </motion.div>

        {/* Customer Details Modal */}
        {showModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">تفاصيل العميل</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info */}
                <div className="lg:col-span-1">
                  <div className="bg-dark-700/50 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">
                          {selectedCustomer.name?.charAt(0)}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-xl">
                        {selectedCustomer.name}
                      </h3>
                      <p className="text-gray-400">
                        عضو منذ{" "}
                        {format(
                          new Date(selectedCustomer.createdAt),
                          "MMMM yyyy",
                          { locale: ar }
                        )}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                          selectedCustomer.isActive
                            ? "bg-green-400/10 text-green-400"
                            : "bg-red-400/10 text-red-400"
                        }`}
                      >
                        {selectedCustomer.isActive ? "نشط" : "محظور"}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center text-gray-300">
                        <Mail className="w-5 h-5 ml-3" />
                        {selectedCustomer.email}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Phone className="w-5 h-5 ml-3" />
                        {selectedCustomer.phone}
                      </div>
                    </div>

                    {(() => {
                      const stats = getCustomerStats(selectedCustomer._id);
                      return (
                        <div className="mt-6 pt-6 border-t border-dark-600">
                          <h4 className="text-white font-semibold mb-4">
                            إحصائيات
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                إجمالي المواعيد
                              </span>
                              <span className="text-white">
                                {stats.totalAppointments}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                المواعيد المكتملة
                              </span>
                              <span className="text-white">
                                {stats.completedAppointments}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                إجمالي الإنفاق
                              </span>
                              <span className="text-primary-500 font-semibold">
                                {stats.totalSpent} ريال
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Appointments History */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-700/50 rounded-lg p-6">
                    <h4 className="text-white font-semibold text-lg mb-4">
                      سجل المواعيد
                    </h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {getCustomerAppointments(selectedCustomer._id).map(
                        (appointment) => (
                          <div
                            key={appointment._id}
                            className="bg-dark-800/50 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="text-white font-medium">
                                  {appointment.service?.nameAr}
                                </h5>
                                <p className="text-gray-400 text-sm">
                                  مع {appointment.barber?.name}{" "}
                                </p>
                              </div>
                              <span className="text-primary-500 font-semibold">
                                {appointment.totalPrice} ريال
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">
                                {format(
                                  new Date(appointment.date),
                                  "dd/MM/yyyy",
                                  { locale: ar }
                                )}{" "}
                                - {appointment.time}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  appointment.status === "completed"
                                    ? "bg-green-400/10 text-green-400"
                                    : appointment.status === "cancelled"
                                    ? "bg-red-400/10 text-red-400"
                                    : "bg-yellow-400/10 text-yellow-400"
                                }`}
                              >
                                {appointment.status === "completed"
                                  ? "مكتمل"
                                  : appointment.status === "cancelled"
                                  ? "ملغي"
                                  : "معلق"}
                              </span>
                            </div>
                          </div>
                        )
                      )}

                      {getCustomerAppointments(selectedCustomer._id).length ===
                        0 && (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">لا توجد مواعيد</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && customerToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  تأكيد الحذف
                </h3>
                <p className="text-gray-400 mb-6">
                  هل أنت متأكد من حذف العميل "{customerToDelete.name}{" "}
                  {customerToDelete.lastName}"؟
                  <br />
                  <span className="text-red-400 text-sm">
                    هذا الإجراء لا يمكن التراجع عنه وسيتم إلغاء جميع مواعيده
                  </span>
                </p>
                <div className="flex justify-center space-x-4 space-x-reverse">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCustomerToDelete(null);
                    }}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleDeleteCustomer}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                  >
                    حذف العميل
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Block/Unblock Confirmation Modal */}
        {showBlockModal && customerToBlock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="text-center">
                {customerToBlock.isActive ? (
                  <Ban className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                ) : (
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                )}
                <h3 className="text-xl font-bold text-white mb-2">
                  {customerToBlock.isActive ? "حظر العميل" : "إلغاء حظر العميل"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {customerToBlock.isActive
                    ? `هل أنت متأكد من حظر العميل "${customerToBlock.name}"؟ لن يتمكن من حجز مواعيد جديدة.`
                    : `هل أنت متأكد من إلغاء حظر العميل "${customerToBlock.name}"؟ سيتمكن من حجز مواعيد جديدة.`}
                </p>
                <div className="flex justify-center space-x-4 space-x-reverse">
                  <button
                    onClick={() => {
                      setShowBlockModal(false);
                      setCustomerToBlock(null);
                    }}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleBlockCustomer}
                    className={`px-6 py-3 rounded-lg transition-all ${
                      customerToBlock.isActive
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {customerToBlock.isActive ? "حظر العميل" : "إلغاء الحظر"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCustomers;
