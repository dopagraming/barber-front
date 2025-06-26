import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Clock, Calendar, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

const TimeManagement = () => {
  const [workingDays, setWorkingDays] = useState([]);

  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState("sunday");
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [showAddTime, setShowAddTime] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchWorkingDays();
    fetchTimeSlots();
  }, [selectedDay]);

  const fetchWorkingDays = async () => {
    try {
      const response = await api.get("api/time-management/working-days");
      if (response.data.length > 0) {
        setWorkingDays(response.data);
      }
    } catch (error) {
      console.error("Error fetching working days:", error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await api.get(
        `api/time-management/time-slots/${selectedDay}`
      );
      setTimeSlots(response.data);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const toggleDay = async (dayId) => {
    const updatedDays = workingDays.map((day) =>
      day.dayId === dayId ? { ...day, enabled: !day.enabled } : day
    );
    setWorkingDays(updatedDays);
    await saveWorkingDays(updatedDays);
  };

  const saveWorkingDays = async (days = workingDays) => {
    try {
      await api.put("api/time-management/working-days", {
        workingDays: days,
      });
      toast.success("تم حفظ أيام العمل بنجاح");
    } catch (error) {
      console.error("Error saving working days:", error);
      toast.error("حدث خطأ في حفظ أيام العمل");
    }
  };

  const addTimeSlot = async () => {
    if (!newTimeSlot) return;

    try {
      const newSlot = {
        time: newTimeSlot,
        workingDays: [selectedDay],
        isActive: true,
      };

      const response = await api.post(
        "api/time-management/time-slots",
        newSlot
      );
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

  const updateTimeSlot = async (slotId, updates) => {
    try {
      const response = await api.put(
        `api/time-management/time-slots/${slotId}`,
        updates
      );
      setTimeSlots((prev) =>
        prev.map((slot) => (slot._id === slotId ? response.data : slot))
      );
      toast.success("تم تحديث الوقت بنجاح");
    } catch (error) {
      console.error("Error updating time slot:", error);
      toast.error("حدث خطأ في تحديث الوقت");
    }
  };

  const deleteTimeSlot = async (slotId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الوقت؟")) return;

    try {
      await api.delete(`api/time-management/time-slots/${slotId}`);
      setTimeSlots((prev) => prev.filter((slot) => slot._id !== slotId));
      toast.success("تم حذف الوقت بنجاح");
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast.error("حدث خطأ في حذف الوقت");
    }
  };

  const toggleTimeSlotDay = async (slotId, dayId) => {
    const slot = timeSlots.find((s) => s._id === slotId);
    if (!slot) return;

    const updatedDays = slot.workingDays.includes(dayId)
      ? slot.workingDays.filter((d) => d !== dayId)
      : [...slot.workingDays, dayId];

    await updateTimeSlot(slotId, { workingDays: updatedDays });
  };

  const getTimeSlotsForDay = (dayId) => {
    return timeSlots.filter(
      (slot) => slot.workingDays.includes(dayId) && slot.isActive
    );
  };

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
              إدارة أوقات العمل
            </h1>
            <p className="text-gray-400">
              تحديد أيام وأوقات العمل المتاحة للحجز
            </p>
          </div>
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
                    <div className="text-xs text-gray-500 mt-1">
                      {getTimeSlotsForDay(day.dayId).length} أوقات متاحة
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDay(day.dayId)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      day.enabled ? "bg-primary-500" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform absolute ${
                        day.enabled ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Time Slots Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-dark-800/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-primary-500 ml-3" />
                <h2 className="text-xl font-bold text-white">إدارة الأوقات</h2>
              </div>
              <button
                onClick={() => setShowAddTime(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center"
              >
                <Plus className="w-4 h-4 ml-1" />
                إضافة وقت
              </button>
            </div>

            {/* Day Selector */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">
                اختر اليوم لإدارة أوقاته:
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                {workingDays.map((day) => (
                  <option key={day.dayId} value={day.dayId}>
                    {day.name}
                  </option>
                ))}
              </select>
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

            {/* Time Slots List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {timeSlots.map((slot) => (
                <div key={slot._id} className="p-4 bg-dark-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-lg">
                      {slot.time}
                    </span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() =>
                          updateTimeSlot(slot._id, { isActive: !slot.isActive })
                        }
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          slot.isActive ? "bg-primary-500" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform absolute ${
                            slot.isActive ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => deleteTimeSlot(slot._id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Days Assignment */}
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      الأيام المتاحة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {workingDays.map((day) => (
                        <button
                          key={day.dayId}
                          onClick={() => toggleTimeSlotDay(slot._id, day.dayId)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                            slot.workingDays.includes(day.dayId)
                              ? "bg-primary-500 text-white"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          {day.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {timeSlots.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">لا توجد أوقات محددة</p>
              </div>
            )}
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
                  .filter((day) => day.isActive)
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
                    {timeSlots.filter((slot) => slot.isActive).length}
                  </span>
                </p>
                <p className="text-white">
                  أوقات معطلة:{" "}
                  <span className="text-red-400">
                    {timeSlots.filter((slot) => !slot.isActive).length}
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
