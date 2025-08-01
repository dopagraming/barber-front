import { useEffect, useState } from "react";
import { Clock, Calendar, XCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../lib/axios";
import { format, isSameDay, isToday, addDays, isBefore } from "date-fns";
import ar from "date-fns/locale/ar";
import toast from "react-hot-toast";

const AppointmentTimeGrid = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // States for new appointment logic
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    barber: "",
    service: "",
    date: "",
    time: "",
    notes: "",
    status: "confirmed",
  });

  // Helper: Get allowed locale (for Arabic calendar names)
  const getDateLocale = () => ar;

  // Fetch appointments for selected date
  const fetchAppointments = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const res = await api.get(
        `api/appointments/by-date?date=${selectedDate}`
      );
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch needed data for modal
  const fetchServicesAndCustomers = async () => {
    try {
      const [servicesRes, customersRes] = await Promise.all([
        api.get("api/services"),
        api.get("api/customers"),
      ]);
      setServices(servicesRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      toast.error("حدث خطأ في تحميل البيانات");
    }
  };

  // Fetch schedule and available days
  const fetchSchedule = async () => {
    try {
      const response = await api.get("api/time-management/settings");
      const { workingDays } = response.data;
      setAvailableDays(
        workingDays.filter(
          (day) =>
            day.enabled &&
            day.services?.some((s) => s.serviceType === newAppointment.service)
        )
      );
    } catch (err) {
      console.error("Failed to load schedule:", err);
    }
  };

  // Fetch available/booked slots for selected date
  const fetchSlotsForDate = async (date) => {
    try {
      const formatted =
        typeof date === "string" ? date : date.toISOString().split("T")[0];
      const response = await api.get(`api/time-management/slots/${formatted}`);
      const allSlots = response.data;
      const available = allSlots
        .filter(
          (slot) =>
            slot.available && slot.serviceType === newAppointment.service
        )
        .map((slot) => slot.time);
      const booked = allSlots
        .filter(
          (slot) =>
            !slot.available && slot.serviceType === newAppointment.service
        )
        .map((slot) => slot.time);
      setAvailableTimes(available);
      setBookedTimes(booked);
    } catch (err) {
      setAvailableTimes([]);
      setBookedTimes([]);
    }
  };

  // Generate dates user can select in the Add modal
  const generateDates = () => {
    const startDate = new Date();
    const results = [];
    const allowed = new Set(availableDays.map((d) => d.id));
    for (let i = 0; i < 60; i++) {
      const date = addDays(startDate, i);
      const dayName = date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      if (allowed.has(dayName)) results.push(date);
      if (results.length >= 14) break;
    }
    return results;
  };
  const dates = generateDates();

  // Handle new appointment date selection
  const handleDateSelect = (date) => {
    setNewAppointment({
      ...newAppointment,
      date: date,
      time: null,
    });
    fetchSlotsForDate(date);
  };

  // Handle new appointment time selection
  const handleTimeSelect = (time) => {
    setNewAppointment({
      ...newAppointment,
      time: time,
    });
  };

  // Only allow future slots
  const isTimeSlotAvailable = (time) => {
    const now = new Date();
    const [h, m] = time.split(":");
    const slot = new Date(newAppointment.date);
    slot.setHours(+h, +m, 0);
    return !isBefore(slot, now);
  };

  // Create a new appointment
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
      fetchAppointments();
      toast.success("تم إضافة الموعد بنجاح");
    } catch (error) {
      toast.error("حدث خطأ في إضافة الموعد");
    }
  };

  // Delete an appointment
  const deleteAppointment = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الموعد؟")) return;
    try {
      await api.delete(`api/appointments/${id}`);
      setShowDetailsModal(false);
      fetchAppointments();
      toast.success("تم حذف الموعد بنجاح");
    } catch (error) {
      toast.error("حدث خطأ في حذف الموعد");
    }
  };

  // Click appointment: show detail modal
  const handleAptClick = (apt) => {
    setSelectedAppointment(apt);
    setShowDetailsModal(true);
  };

  // Effect: fetch appointments on date change
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  // Effect: Fetch services and customers on first open of modal
  useEffect(() => {
    if (showAddModal) {
      fetchServicesAndCustomers();
    }
  }, [showAddModal]);

  // Effect: Update available days when service changes
  useEffect(() => {
    if (newAppointment.service) fetchSchedule();
  }, [newAppointment.service]);

  // Effect: Update available times when date changes
  useEffect(() => {
    if (newAppointment.date) fetchSlotsForDate(newAppointment.date);
  }, [newAppointment.date, newAppointment.service]);

  // Render
  const sorted = [...appointments].sort((a, b) =>
    a?.time?.localeCompare(b.time)
  );

  return (
    <div className="max-w-5xl mx-auto p-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Clock className="w-6 h-6 ml-2" />
          مواعيد الصالون
        </h2>

        <div className="flex items-center gap-2">
          <button
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg px-5 py-2 transition-all"
            onClick={() => setShowAddModal(true)}
          >
            إضافة موعد جديد
          </button>
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">
          جاري تحميل المواعيد...
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sorted.map((apt, i) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg bg-dark-700 border border-dark-600 hover:border-primary-500 cursor-pointer transition-all relative"
              onClick={() => handleAptClick(apt)}
            >
              {/* Cancelled Badge */}
              {apt.status === "cancelled" && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-lg shadow z-10">
                  ملغى
                </span>
              )}

              <p className="text-primary-400 font-bold text-sm mb-1">
                {apt.time}
              </p>
              <p className="text-white font-medium text-sm">
                {apt.customerName || apt.customer?.name}
              </p>
              <p className="text-gray-400 text-xs">{apt.customer?.phone}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-4" />
          لا توجد مواعيد في هذا اليوم
        </div>
      )}

      {/* Add Appointment Modal */}
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
              {newAppointment.service && (
                <div className="mb-8">
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <Calendar className="w-5 h-5 ml-2" /> أختر التاريخ
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {dates.map((date, i) => (
                      <motion.button
                        type="button"
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                        onClick={() => handleDateSelect(date)}
                        className={`p-2 rounded-md text-center transition-all text-xs ${
                          isSameDay(newAppointment.date, date)
                            ? "bg-primary-500 text-white"
                            : "bg-dark-700 text-gray-300 hover:bg-dark-600"
                        }`}
                      >
                        <div className="font-medium">
                          {format(date, "EEE", { locale: getDateLocale() })}
                        </div>
                        <div className="font-bold text-sm">
                          {format(date, "d")}
                        </div>
                        <div className="text-[10px]">
                          {format(date, "MMM", { locale: getDateLocale() })}
                        </div>
                        {isToday(date) && (
                          <div className="text-[10px] text-primary-300 mt-1">
                            اليوم
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              {newAppointment.date && (
                <div className="mb-8">
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 ml-2" /> أختر الوقت
                  </h4>
                  {[...availableTimes, ...bookedTimes].length > 0 && dates ? (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {[...new Set([...availableTimes, ...bookedTimes])]
                        .sort((a, b) => a.localeCompare(b))
                        .map((time, i) => {
                          const isBooked = bookedTimes.includes(time);
                          const available =
                            !isBooked && isTimeSlotAvailable(time);
                          return (
                            <motion.button
                              type="button"
                              key={time}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: i * 0.02 }}
                              onClick={() =>
                                available && handleTimeSelect(time)
                              }
                              disabled={!available}
                              className={`p-1.5 rounded-md text-center text-xs transition-all ${
                                newAppointment.time === time
                                  ? "bg-primary-500 text-white"
                                  : isBooked
                                  ? "bg-dark-900 text-gray-500 cursor-not-allowed"
                                  : available
                                  ? "bg-dark-700 text-gray-300 hover:bg-dark-600"
                                  : "bg-dark-800 text-gray-600 cursor-not-allowed"
                              }`}
                            >
                              <div>{time}</div>
                              {isBooked && (
                                <div className="text-[10px] mt-1">محجوز</div>
                              )}
                            </motion.button>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">لا يوجد أوقات متاحة</p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
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
                  }}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center"
                >
                  إضافة الموعد
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">تفاصيل الموعد</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-bold text-gray-300">اسم العميل: </span>
                <span className="text-white">
                  {selectedAppointment.customerName ||
                    selectedAppointment.customer?.name}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-300">الهاتف: </span>
                <span className="text-white">
                  {selectedAppointment.customer?.phone}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-300">الخدمة: </span>
                <span className="text-white">
                  {selectedAppointment.service?.nameAr}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-300">التاريخ: </span>
                <span className="text-white">
                  {format(
                    new Date(selectedAppointment.date),
                    "EEEE، d MMMM yyyy",
                    { locale: ar }
                  )}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-300">الوقت: </span>
                <span className="text-white">{selectedAppointment.time}</span>
              </div>
              <div>
                <span className="font-bold text-gray-300">سعر الخدمة: </span>
                <span className="text-white">
                  {selectedAppointment.totalPrice} شيكل
                </span>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <span className="font-bold text-gray-300">ملاحظات: </span>
                  <span className="text-white">
                    {selectedAppointment.notes}
                  </span>
                </div>
              )}
              <div>
                <span className="font-bold text-gray-300">الحالة: </span>
                <span className={`text-white`}>
                  {selectedAppointment.status === "cancelled"
                    ? "ملغي"
                    : selectedAppointment.status === "confirmed"
                    ? "مؤكد"
                    : selectedAppointment.status}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-8 gap-2">
              {/* Cancel button (if not already cancelled) */}
              {selectedAppointment.status !== "cancelled" && (
                <button
                  onClick={async () => {
                    try {
                      await api.put(
                        `api/appointments/${selectedAppointment._id}`,
                        { status: "cancelled" }
                      );
                      toast.success("تم إلغاء الموعد بنجاح");
                      setShowDetailsModal(false);
                      fetchAppointments();
                    } catch {
                      toast.error("حدث خطأ في إلغاء الموعد");
                    }
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-medium flex items-center"
                >
                  <XCircle className="w-5 h-5 ml-2" />
                  إلغاء الموعد
                </button>
              )}
              {/* Delete button */}
              <button
                onClick={() => deleteAppointment(selectedAppointment._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium flex items-center"
              >
                <Trash2 className="w-5 h-5 ml-2" />
                حذف الموعد
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppointmentTimeGrid;
