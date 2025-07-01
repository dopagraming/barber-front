import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  ArrowRight,
  MessageSquare,
  Users,
  Repeat,
} from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { ar, enUS, he } from "date-fns/locale";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../lib/axios";

const BookingConfirmation = ({ data, updateData, onNext, onPrev }) => {
  const [notes, setNotes] = useState(data.notes || "");
  const [loading, setLoading] = useState(false);
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

  const generateTimeSlots = (startTime, duration, count) => {
    const slots = [];
    let current = new Date(`2000-01-01T${startTime}:00`);

    for (let i = 0; i < count; i++) {
      slots.push(current.toTimeString().slice(0, 5));
      current = new Date(current.getTime() + duration * 60000);
    }

    return slots;
  };

  const handleNotesChange = (e) => {
    const value = e.target.value;
    setNotes(value);
    updateData({ notes: value });
  };

  const generateAppointmentDates = () => {
    if (!data.isRepeating) return [data.date];

    const dates = [data.date];
    const { interval, unit, occurrences } = data.repeatConfig;

    for (let i = 1; i < occurrences; i++) {
      let nextDate = new Date(data.date);

      if (unit === "day") {
        nextDate = addDays(nextDate, interval * i);
      } else if (unit === "week") {
        nextDate = addWeeks(nextDate, interval * i);
      } else if (unit === "month") {
        nextDate = addMonths(nextDate, interval * i);
      }

      dates.push(nextDate);
    }

    return dates;
  };

  const appointmentDates = generateAppointmentDates();
  const totalCost =
    (data.service?.price || 0) *
    (data.peopleCount || 1) *
    appointmentDates.length;

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const appointmentDates = generateAppointmentDates();
      const serviceDuration = data.service?.duration || 20;
      const peopleCount = data.peopleCount || 1;

      const allAppointments = [];

      for (const appointmentDate of appointmentDates) {
        const timeSlots = generateTimeSlots(
          data.time,
          serviceDuration,
          peopleCount
        );

        for (let i = 0; i < timeSlots.length; i++) {
          const appointmentData = {
            service: data.service._id,
            date: appointmentDate,
            time: timeSlots[i],
            notes,
            peopleCount: 1,
            totalPrice: data.service.price,
            isRepeating: data.isRepeating || false,
            repeatConfig: data.isRepeating ? data.repeatConfig : undefined,
            serviceDuration, // Important for slot overlap checks
          };

          const response = await api.post("api/appointments", appointmentData);
          allAppointments.push(response.data);
        }
      }

      updateData({
        appointmentId: allAppointments[0]._id,
        allAppointments,
      });

      toast.success(
        data.isRepeating
          ? t("appointmentsBookedSuccess")
          : t("appointmentBookedSuccess")
      );
      onNext();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(t("appointmentBookingError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-800/50 rounded-2xl p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">
          {t("confirmBooking")}
        </h3>
        <p className="text-gray-400">{t("reviewBeforeConfirm")}</p>
      </div>

      {/* Booking Summary */}
      <div className="bg-dark-700/50 rounded-lg p-6 mb-8">
        <h4 className="text-white font-semibold text-lg mb-6">
          {t("bookingSummary")}
        </h4>

        <div className="space-y-4">
          {/* Service */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-primary-500" />
            </div>
            <div className="flex-1">
              <h5 className="text-white font-medium">{data.service?.nameAr}</h5>
              <p className="text-gray-400 text-sm">
                {data.service?.duration} {t("minutes")}
              </p>
            </div>
            <div className="text-primary-500 font-bold text-lg">
              {data.service?.price} {t("currency")}
            </div>
          </div>

          {/* People Count */}
          {(data.peopleCount || 1) > 1 && (
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h5 className="text-white font-medium">
                  {t("numberOfPeople")}
                </h5>
                <p className="text-gray-400 text-sm">
                  {data.peopleCount} {t("people")}
                </p>
              </div>
              <div className="text-blue-500 font-bold text-lg">
                {(data.service?.price || 0) * data.peopleCount} {t("currency")}
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-500" />
            </div>
            <div className="flex-1">
              <h5 className="text-white font-medium">
                {format(data.date, "EEEE، d MMMM yyyy", {
                  locale: getDateLocale(),
                })}
              </h5>
              <div className="flex items-center text-gray-400 text-sm">
                <Clock className="w-4 h-4 ml-1" />
                {data.time}
              </div>
            </div>
          </div>

          {/* Repeat Information */}
          {data.isRepeating && (
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Repeat className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h5 className="text-white font-medium">{t("repeatInfo")}</h5>
                <p className="text-gray-400 text-sm">
                  {t("every")} {data.repeatConfig.interval}{" "}
                  {data.repeatConfig.unit === "day"
                    ? t("day")
                    : data.repeatConfig.unit === "week"
                    ? t("week")
                    : t("month")}{" "}
                  {t("for")} {data.repeatConfig.occurrences} {t("times")}
                </p>
              </div>
              <div className="text-green-500 font-bold text-lg">
                {appointmentDates.length} {t("appointments")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label className="block text-white font-medium mb-3">
          <MessageSquare className="w-5 h-5 inline ml-2" />
          {t("additionalNotes")}
        </label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder={t("notesPlaceholder")}
          className="w-full p-4 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none"
          rows={4}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="flex items-center px-6 py-3 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          {t("previous")}
        </button>

        <button
          onClick={handleConfirmBooking}
          disabled={loading}
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("bookingInProgress") : t("confirmBooking")}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
