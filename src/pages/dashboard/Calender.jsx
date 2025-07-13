import { useEffect, useState } from "react";
import { Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../lib/axios";

const AppointmentTimeGrid = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const res = await api.get(
        `api/appointments/by-date?date=${selectedDate}`
      );
      console.log(res.data);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

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

        <div className="flex items-center space-x-2 space-x-reverse">
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
              className="p-4 rounded-lg bg-dark-700 border border-dark-600 hover:border-primary-500 transition-all"
            >
              <p className="text-primary-400 font-bold text-sm mb-1">
                {apt.time}
              </p>
              <p className="text-white font-medium text-sm">
                {apt.customer?.name}
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
    </div>
  );
};

export default AppointmentTimeGrid;
