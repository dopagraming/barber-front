import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { format, addDays, isSameDay, isToday, isBefore } from "date-fns";
import { ar, enUS, he } from "date-fns/locale";
import LoadingSpinner from "../LoadingSpinner";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../lib/axios";

const DateTimeSelection = ({ data, updateData, onNext, onPrev }) => {
  const [selectedDate, setSelectedDate] = useState(data.date || new Date());
  const [selectedTime, setSelectedTime] = useState(data.time || null);
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlotsForDate(selectedDate);
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      const response = await api.get("api/time-management/settings");
      const { workingDays } = response.data;
      setAvailableDays(
        workingDays.filter(
          (day) =>
            day.enabled &&
            day.services?.some((s) => s.serviceType === data.service._id)
        )
      );
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotsForDate = async (date) => {
    try {
      const formatted = date.toISOString().split("T")[0];
      const response = await api.get(`api/time-management/slots/${formatted}`);
      console.log(response.data);
      const times = response.data
        .filter(
          (slot) => slot.available && slot.serviceType === data.service._id // only show matching service times
        )
        .map((s) => s.time);
      setAvailableTimes(times);
    } catch (err) {
      console.error("Failed to load time slots:", err);
      setAvailableTimes([]);
    }
  };

  const generateDates = () => {
    const today = new Date();
    const results = [];
    const allowed = new Set(availableDays.map((d) => d.id));

    for (let i = 0; i < 60; i++) {
      const date = addDays(today, i);
      const dayName = date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      if (allowed.has(dayName)) results.push(date);
      if (results.length >= 14) break;
    }

    return results;
  };

  const dates = generateDates();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    updateData({ date, time: null });
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    updateData({ time });
  };

  const isTimeSlotAvailable = (time) => {
    const now = new Date();
    const [h, m] = time.split(":");
    const slot = new Date(selectedDate);
    slot.setHours(+h, +m, 0);
    return !isBefore(slot, now);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-dark-800/50 rounded-2xl p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">
          {t("selectDateAndTime")}
        </h3>
      </div>

      {/* Date Selection */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 ml-2" /> {t("selectDate")}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {dates.map((date, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              onClick={() => handleDateSelect(date)}
              className={`p-3 rounded-lg text-center transition-all ${
                isSameDay(selectedDate, date)
                  ? "bg-primary-500 text-white"
                  : "bg-dark-700 text-gray-300 hover:bg-dark-600"
              }`}
            >
              <div className="text-sm font-medium">
                {format(date, "EEE", { locale: getDateLocale() })}
              </div>
              <div className="text-lg font-bold">{format(date, "d")}</div>
              <div className="text-xs">
                {format(date, "MMM", { locale: getDateLocale() })}
              </div>
              {isToday(date) && (
                <div className="text-xs text-primary-300 mt-1">
                  {t("today")}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 ml-2" /> {t("selectTime")}
        </h4>
        {availableTimes.length > 0 && dates ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {availableTimes.map((time, i) => {
              const available = isTimeSlotAvailable(time);
              return (
                <motion.button
                  key={time}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  onClick={() => available && handleTimeSelect(time)}
                  disabled={!available}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedTime === time
                      ? "bg-primary-500 text-white"
                      : available
                      ? "bg-dark-700 text-gray-300 hover:bg-dark-600"
                      : "bg-dark-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {time}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">{t("noAvailableSlots")}</p>
          </div>
        )}
      </div>
      <label className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          checked={data.isRepeating}
          onChange={(e) => updateData({ isRepeating: e.target.checked })}
        />
        <span className="text-gray-400">{t("wantToRepeat")}</span>
      </label>
      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="flex items-center px-6 py-3 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-2" /> {t("previous")}
        </button>
        <button
          onClick={() => selectedDate && selectedTime && onNext()}
          disabled={!selectedDate || !selectedTime}
          className={`px-8 py-3 rounded-lg font-semibold transition-all ${
            selectedDate && selectedTime
              ? "bg-primary-500 hover:bg-primary-600 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

export default DateTimeSelection;
