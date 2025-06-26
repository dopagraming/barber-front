import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Repeat, X } from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { ar } from "date-fns/locale";

const RepeatOptions = ({ data, updateData, onNext, onPrev }) => {
  const [wantRepeat, setWantRepeat] = useState(data.isRepeating || false);
  const [repeatConfig, setRepeatConfig] = useState(
    data.repeatConfig || {
      interval: 1,
      unit: "week",
      occurrences: 4,
    }
  );

  const handleRepeatChange = (value) => {
    setWantRepeat(value);
    updateData({ isRepeating: value });
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...repeatConfig, [key]: value };
    setRepeatConfig(newConfig);
    updateData({ repeatConfig: newConfig });
  };

  const generatePreviewDates = () => {
    if (!wantRepeat || !data.date) return [data.date];

    const dates = [data.date];
    const { interval, unit, occurrences } = repeatConfig;

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

  const previewDates = generatePreviewDates();
  const totalCost =
    (data.service?.price || 0) * (data.peopleCount || 1) * previewDates.length;

  const handleContinue = () => {
    if (wantRepeat) {
      updateData({
        isRepeating: true,
        repeatConfig,
        totalAppointments: previewDates.length,
        totalCost,
      });
    } else {
      updateData({
        isRepeating: false,
        totalAppointments: 1,
        totalCost: (data.service?.price || 0) * (data.peopleCount || 1),
      });
    }
    onNext();
  };

  return (
    <div className="bg-dark-800/50 rounded-2xl p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Repeat className="w-6 h-6 ml-2" />
          تكرار الموعد
        </h3>
        <p className="text-gray-400">هل تريد تكرار هذا الموعد؟</p>
      </div>

      {/* Current Appointment Summary */}
      <div className="bg-dark-700/50 rounded-lg p-4 mb-8">
        <h4 className="text-white font-semibold mb-3">الموعد المحدد:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-300">
            <Calendar className="w-4 h-4 ml-2" />
            {data.date &&
              format(data.date, "EEEE، d MMMM yyyy", { locale: ar })}
          </div>
          <div className="flex items-center text-gray-300">
            <Clock className="w-4 h-4 ml-2" />
            {data.time}
          </div>
        </div>
      </div>

      {/* Repeat Options */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4">خيارات التكرار:</h4>

        <div className="space-y-4">
          <label className="flex items-center p-4 bg-dark-700/50 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
            <input
              type="radio"
              name="repeat"
              checked={!wantRepeat}
              onChange={() => handleRepeatChange(false)}
              className="ml-3 text-primary-500"
            />
            <div>
              <span className="text-white font-medium">موعد واحد فقط</span>
              <p className="text-gray-400 text-sm">حجز موعد واحد بدون تكرار</p>
            </div>
          </label>

          <label className="flex items-center p-4 bg-dark-700/50 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
            <input
              type="radio"
              name="repeat"
              checked={wantRepeat}
              onChange={() => handleRepeatChange(true)}
              className="ml-3 text-primary-500"
            />
            <div>
              <span className="text-white font-medium">تكرار الموعد</span>
              <p className="text-gray-400 text-sm">
                حجز مواعيد متكررة بفترات منتظمة
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Repeat Configuration */}
      {wantRepeat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8"
        >
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-6">
            <h4 className="text-primary-400 font-semibold mb-4">
              إعدادات التكرار:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Interval */}
              <div>
                <label className="block text-white font-medium mb-2">كل:</label>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      handleConfigChange(
                        "interval",
                        Math.max(1, repeatConfig.interval - 1)
                      )
                    }
                    className="w-8 h-8 bg-dark-700 hover:bg-dark-600 text-white rounded-l-lg flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 bg-dark-700 text-white text-center min-w-[60px]">
                    {repeatConfig.interval}
                  </span>
                  <button
                    onClick={() =>
                      handleConfigChange("interval", repeatConfig.interval + 1)
                    }
                    className="w-8 h-8 bg-dark-700 hover:bg-dark-600 text-white rounded-r-lg flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-white font-medium mb-2">
                  الوحدة:
                </label>
                <select
                  value={repeatConfig.unit}
                  onChange={(e) => handleConfigChange("unit", e.target.value)}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="day">يوم</option>
                  <option value="week">أسبوع</option>
                  <option value="month">شهر</option>
                </select>
              </div>

              {/* Occurrences */}
              <div>
                <label className="block text-white font-medium mb-2">
                  عدد المرات:
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      handleConfigChange(
                        "occurrences",
                        Math.max(1, repeatConfig.occurrences - 1)
                      )
                    }
                    className="w-8 h-8 bg-dark-700 hover:bg-dark-600 text-white rounded-l-lg flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 bg-dark-700 text-white text-center min-w-[60px]">
                    {repeatConfig.occurrences}
                  </span>
                  <button
                    onClick={() =>
                      handleConfigChange(
                        "occurrences",
                        repeatConfig.occurrences + 1
                      )
                    }
                    className="w-8 h-8 bg-dark-700 hover:bg-dark-600 text-white rounded-r-lg flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-dark-800/50 rounded-lg p-4">
              <h5 className="text-white font-medium mb-3">معاينة المواعيد:</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {previewDates.map((date, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-300">
                      {index + 1}.{" "}
                      {format(date, "EEEE، d MMMM yyyy", { locale: ar })} -{" "}
                      {data.time}
                    </span>
                    <span className="text-primary-500 font-medium">
                      {(data.service?.price || 0) * (data.peopleCount || 1)}{" "}
                      ريال
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-600 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">
                    المجموع الكلي:
                  </span>
                  <span className="text-primary-500 font-bold text-lg">
                    {totalCost} ريال
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {previewDates.length} موعد × {data.peopleCount || 1} شخص
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="flex items-center px-6 py-3 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          السابق
        </button>

        <button
          onClick={handleContinue}
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default RepeatOptions;
