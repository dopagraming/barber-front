import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Repeat, AlertCircle } from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { ar } from "date-fns/locale";

const RepeatOptions = ({ data, updateData, onNext, onPrev }) => {
  const [wantRepeat, setWantRepeat] = useState(data.wantRepeat || false);
  const [repeatInterval, setRepeatInterval] = useState(
    data.repeatInterval || 1
  );
  const [repeatUnit, setRepeatUnit] = useState(data.repeatUnit || "week");
  const [repeatCount, setRepeatCount] = useState(data.repeatCount || 4);

  const handleRepeatChange = (value) => {
    setWantRepeat(value);
    updateData({ wantRepeat: value });
  };

  const handleIntervalChange = (value) => {
    if (value >= 1 && value <= 12) {
      setRepeatInterval(value);
      updateData({ repeatInterval: value });
    }
  };

  const handleUnitChange = (value) => {
    setRepeatUnit(value);
    updateData({ repeatUnit: value });
  };

  const handleCountChange = (value) => {
    if (value >= 1 && value <= 52) {
      setRepeatCount(value);
      updateData({ repeatCount: value });
    }
  };

  const generateRepeatDates = () => {
    if (!wantRepeat || !data.date) return [];

    const dates = [];
    let currentDate = new Date(data.date);

    for (let i = 0; i < repeatCount; i++) {
      dates.push(new Date(currentDate));

      switch (repeatUnit) {
        case "day":
          currentDate = addDays(currentDate, repeatInterval);
          break;
        case "week":
          currentDate = addWeeks(currentDate, repeatInterval);
          break;
        case "month":
          currentDate = addMonths(currentDate, repeatInterval);
          break;
      }
    }

    return dates;
  };

  const handleContinue = () => {
    const repeatDates = wantRepeat ? generateRepeatDates() : [data.date];
    updateData({
      wantRepeat,
      repeatInterval,
      repeatUnit,
      repeatCount,
      repeatDates,
    });
    onNext();
  };

  const getUnitText = (unit) => {
    switch (unit) {
      case "day":
        return "يوم";
      case "week":
        return "أسبوع";
      case "month":
        return "شهر";
      default:
        return unit;
    }
  };

  const repeatDates = generateRepeatDates();
  const totalCost =
    (data.service?.price || 0) *
    (data.peopleCount || 1) *
    (wantRepeat ? repeatCount : 1);

  return (
    <div className="bg-dark-800/50 rounded-2xl p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Repeat className="w-6 h-6 ml-2" />
          تكرار الموعد
        </h3>
        <p className="text-gray-400">هل تريد تكرار هذا الموعد بانتظام؟</p>
      </div>

      {/* Current Appointment Summary */}
      <div className="bg-dark-700/50 rounded-lg p-4 mb-8">
        <h4 className="text-white font-semibold mb-3">ملخص الموعد:</h4>
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
          <div className="text-gray-300">الخدمة: {data.service?.nameAr}</div>
          <div className="text-gray-300">
            عدد الأشخاص: {data.peopleCount || 1}
          </div>
        </div>
      </div>

      {/* Repeat Question */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4">تكرار الموعد:</h4>
        <div className="space-y-4">
          <label className="flex items-center p-4 bg-dark-700/50 rounded-lg cursor-pointer hover:bg-dark-700 transition-all">
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

          <label className="flex items-center p-4 bg-dark-700/50 rounded-lg cursor-pointer hover:bg-dark-700 transition-all">
            <input
              type="radio"
              name="repeat"
              checked={wantRepeat}
              onChange={() => handleRepeatChange(true)}
              className="ml-3 text-primary-500"
            />
            <div>
              <span className="text-white font-medium">تكرار الموعد</span>
              <p className="text-gray-400 text-sm">حجز مواعيد متكررة بانتظام</p>
            </div>
          </label>
        </div>
      </div>

      {/* Repeat Options */}
      {wantRepeat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="bg-dark-700/50 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-4">إعدادات التكرار:</h4>

            {/* Repeat Interval */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">
                تكرر كل:
              </label>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleIntervalChange(repeatInterval - 1)}
                    disabled={repeatInterval <= 1}
                    className="w-8 h-8 rounded bg-dark-600 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 bg-dark-600 rounded text-center min-w-[60px] text-white">
                    {repeatInterval}
                  </span>
                  <button
                    onClick={() => handleIntervalChange(repeatInterval + 1)}
                    disabled={repeatInterval >= 12}
                    className="w-8 h-8 rounded bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white"
                  >
                    +
                  </button>
                </div>

                <select
                  value={repeatUnit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="bg-dark-600 border border-dark-500 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="day">يوم</option>
                  <option value="week">أسبوع</option>
                  <option value="month">شهر</option>
                </select>
              </div>
            </div>

            {/* Repeat Count */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">
                عدد التكرارات:
              </label>
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={() => handleCountChange(repeatCount - 1)}
                  disabled={repeatCount <= 1}
                  className="w-8 h-8 rounded bg-dark-600 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white"
                >
                  -
                </button>
                <span className="px-4 py-2 bg-dark-600 rounded text-center min-w-[60px] text-white">
                  {repeatCount}
                </span>
                <button
                  onClick={() => handleCountChange(repeatCount + 1)}
                  disabled={repeatCount >= 52}
                  className="w-8 h-8 rounded bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white"
                >
                  +
                </button>
                <span className="text-gray-400">مرة</span>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-dark-800/50 rounded-lg p-4">
              <h5 className="text-white font-medium mb-3">معاينة المواعيد:</h5>
              <p className="text-gray-400 text-sm mb-3">
                كل {repeatInterval} {getUnitText(repeatUnit)} في {data.time}
              </p>

              <div className="max-h-32 overflow-y-auto space-y-1">
                {repeatDates.slice(0, 5).map((date, index) => (
                  <div key={index} className="text-sm text-gray-300">
                    {index + 1}.{" "}
                    {format(date, "EEEE، d MMMM yyyy", { locale: ar })}
                  </div>
                ))}
                {repeatDates.length > 5 && (
                  <div className="text-sm text-gray-400">
                    ... و {repeatDates.length - 5} مواعيد أخرى
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cost Summary */}
      <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-primary-400 font-semibold">
              التكلفة الإجمالية:
            </h4>
            <p className="text-primary-300 text-sm">
              {wantRepeat
                ? `${data.service?.price} شيكل × ${
                    data.peopleCount || 1
                  } شخص × ${repeatCount} مرة`
                : `${data.service?.price} شيكل × ${data.peopleCount || 1} شخص`}
            </p>
          </div>
          <div className="text-primary-500 font-bold text-2xl">
            {totalCost} شيكل
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
        <div className="flex items-start space-x-3 space-x-reverse">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h5 className="text-yellow-400 font-medium mb-1">ملاحظة مهمة:</h5>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>• سيتم حجز جميع المواعيد مع نفس الحلاق</li>
              <li>• يمكن إلغاء أو تعديل أي موعد منفرد لاحقاً</li>
              <li>• الدفع مطلوب عند كل موعد</li>
              {wantRepeat && <li>• سيتم إرسال تذكير قبل كل موعد بـ 24 ساعة</li>}
            </ul>
          </div>
        </div>
      </div>

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
