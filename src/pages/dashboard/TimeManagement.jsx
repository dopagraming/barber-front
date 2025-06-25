import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Clock, Calendar, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

const TimeManagement = () => {
  const [workingDays, setWorkingDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [showAddTime, setShowAddTime] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [daysResponse, slotsResponse] = await Promise.all([
        api.get("api/time-management/working-days"),
        api.get("api/time-management/time-slots"),
      ]);

      setWorkingDays(daysResponse.data);
      setTimeSlots(slotsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = async (dayId) => {
    const updatedDays = workingDays.map((day) =>
      day.dayId === dayId ? { ...day, enabled: !day.enabled } : day
    );
    setWorkingDays(updatedDays);
  };

  const toggleTimeSlot = async (timeId) => {
    try {
      const slot = timeSlots.find((s) => s._id === timeId);
      const response = await api.put(
        `api/time-management/time-slots/${timeId}`,
        {
          enabled: !slot.enabled,
        }
      );

      setTimeSlots((prev) =>
        prev.map((slot) => (slot._id === timeId ? response.data : slot))
      );
    } catch (error) {
      console.error("Error updating time slot:", error);
      toast.error("حدث خطأ في تحديث الوقت");
    }
  };

  const addTimeSlot = async () => {
    if (!newTimeSlot) return;

    try {
      const response = await api.post("api/time-management/time-slots", {
        time: newTimeSlot,
      });

      setTimeSlots((prev) =>
        [...prev, response.data].sort((a, b) => a.time.localeCompare(b.time))
      );
      setNewTimeSlot("");
      setShowAddTime(false);
      toast.success("تم إضافة الوقت بنجاح");
    } catch (error) {
      console.error("Error adding time slot:", error);
      toast.error("حدث خطأ في إضافة الوقت");
    }
  };

  const deleteTimeSlot = async (timeId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الوقت؟")) return;

    try {
      await api.delete(`api/time-management/time-slots/${timeId}`);
      setTimeSlots((prev) => prev.filter((slot) => slot._id !== timeId));
      toast.success("تم حذف الوقت بنجاح");
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast.error("حدث خطأ في حذف الوقت");
    }
  };

  const saveSettings = async () => {
    try {
      await api.put("api/time-management/working-days", {
        workingDays: workingDays.map((day) => ({
          id: day.dayId,
          name: day.name,
          nameHe: day.nameHe,
          enabled: day.enabled,
          order: day.order,
        })),
      });
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("حدث خطأ في حفظ الإعدادات");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              إدارة أوقات العمل
            </h1>
            <p className="text-gray-400">
              تحديد أيام وأوقات العمل المتاحة للحجز
            </p>
          </div>
          <button
            onClick={saveSettings}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
          >
            <Save className="w-5 h-5 ml-2" />
            حفظ الإعدادات
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Working Days */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-dark-800/50 rounded-lg p-6"
          >
            <div className="flex items-center mb-6">
              <Calendar className="w-6 h-6 text-primary-500 ml-3" />
              <h2 className="text-xl font-bold text-white">أيام العمل</h2>
            </div>

            <div className="space-y-4">
              {workingDays.map((day) => (
                <div
                  key={day.dayId}
                  className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg"
                >
                  <div>
                    <span className="text-white font-medium">{day.name}</span>
                    <span className="text-gray-400 text-sm mr-2">
                      ({day.nameHe})
                    </span>
                  </div>
                  <button
                    onClick={() => toggleDay(day.dayId)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      day.enabled ? "bg-primary-500" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        day.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                <strong>ملاحظة:</strong> الأيام المفعلة فقط ستظهر للعملاء عند
                الحجز
              </p>
            </div>
          </motion.div>

          {/* Time Slots */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-dark-800/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-primary-500 ml-3" />
                <h2 className="text-xl font-bold text-white">أوقات العمل</h2>
              </div>
              <button
                onClick={() => setShowAddTime(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center"
              >
                <Plus className="w-4 h-4 ml-1" />
                إضافة وقت
              </button>
            </div>

            {/* Add Time Slot Form */}
            {showAddTime && (
              <div className="mb-6 p-4 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="time"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="flex-1 px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={addTimeSlot}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTime(false);
                      setNewTimeSlot("");
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {timeSlots.map((slot) => (
                <div
                  key={slot._id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    slot.enabled
                      ? "bg-primary-500/10 border-primary-500/30"
                      : "bg-dark-700/50 border-dark-600"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      slot.enabled ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {slot.time}
                  </span>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => toggleTimeSlot(slot._id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        slot.enabled ? "bg-primary-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          slot.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => deleteTimeSlot(slot._id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>تنبيه:</strong> الأوقات المفعلة فقط ستكون متاحة للحجز
              </p>
            </div>
          </motion.div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 bg-dark-800/50 rounded-lg p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">
            ملخص الإعدادات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-gray-400 font-medium mb-2">
                أيام العمل النشطة:
              </h4>
              <div className="flex flex-wrap gap-2">
                {workingDays
                  .filter((day) => day.enabled)
                  .map((day) => (
                    <span
                      key={day.dayId}
                      className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                    >
                      {day.name}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="text-gray-400 font-medium mb-2">
                إحصائيات الأوقات:
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-white">
                  إجمالي الأوقات:{" "}
                  <span className="text-primary-500">{timeSlots.length}</span>
                </p>
                <p className="text-white">
                  أوقات نشطة:{" "}
                  <span className="text-green-400">
                    {timeSlots.filter((slot) => slot.enabled).length}
                  </span>
                </p>
                <p className="text-white">
                  أوقات معطلة:{" "}
                  <span className="text-red-400">
                    {timeSlots.filter((slot) => !slot.enabled).length}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TimeManagement;
