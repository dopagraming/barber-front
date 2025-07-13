// Updated TimeManagement.jsx
import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const TimeManagement = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [timeManagementRes, servicesRes] = await Promise.all([
        api.get("api/time-management/settings"),
        api.get("api/services"),
      ]);
      setSettings(timeManagementRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      toast.error("فشل في تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (dayId, key, value) => {
    const updated = settings.workingDays.map((day) =>
      day.id === dayId ? { ...day, [key]: value } : day
    );
    setSettings({ ...settings, workingDays: updated });
  };

  const validateDayServices = () => {
    const newErrors = {};
    settings.workingDays.forEach((day) => {
      if (!day.enabled) return;
      day.services?.forEach((service, idx) => {
        if (
          service.startTime &&
          service.endTime &&
          service.startTime >= service.endTime
        ) {
          newErrors[`${day.id}-${idx}`] =
            "وقت النهاية يجب أن يكون بعد وقت البداية";
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSettings = async () => {
    const isValid = validateDayServices();
    if (!isValid) {
      toast.error("تأكد من صحة أوقات الخدمات قبل الحفظ");
      return;
    }
    try {
      await api.put("api/time-management/settings", settings);
      toast.success("تم حفظ الإعدادات");
    } catch (err) {
      toast.error("فشل في حفظ الإعدادات");
    }
  };

  if (loading || !settings)
    return <div className="text-white p-4">{t("loading")}</div>;

  return (
    <div className="text-white p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{t("workingHoursSettings")}</h2>

      <div className="space-y-4">
        {settings.workingDays.map((day) => (
          <div
            key={day.id}
            className="bg-dark-700 p-4 rounded-lg space-y-2 border border-dark-600"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{day.name}</span>
              <label className="flex items-center space-x-2 space-x-reverse">
                <span>{t("enable")}</span>
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(e) =>
                    updateSetting(day.id, "enabled", e.target.checked)
                  }
                />
              </label>
            </div>
            {day.enabled && (
              <>
                <div className="space-y-4">
                  {/* Services list per day */}
                  {day.services?.map((serviceItem, idx) => (
                    <div key={idx} className="flex flex-wrap justify-between">
                      <select
                        value={serviceItem.serviceType || ""}
                        onChange={(e) => {
                          const newServices = [...(day.services || [])];
                          newServices[idx] = {
                            ...newServices[idx],
                            serviceType: e.target.value,
                          };
                          updateSetting(day.id, "services", newServices);
                        }}
                        className="p-2 rounded bg-dark-600 border border-dark-500 mb-2"
                      >
                        <option value="">اختر خدمة</option>
                        {services?.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.nameAr}
                          </option>
                        ))}
                      </select>
                      <div className="space-y-1">
                        <input
                          type="time"
                          value={serviceItem.startTime || ""}
                          onChange={(e) => {
                            const newServices = [...(day.services || [])];
                            newServices[idx] = {
                              ...newServices[idx],
                              startTime: e.target.value,
                            };
                            updateSetting(day.id, "services", newServices);
                          }}
                          className="p-2 rounded bg-dark-600 border border-dark-500 mb-2"
                        />
                        {errors[`${day.id}-${idx}`] && (
                          <p className="text-red-500 text-sm">
                            {errors[`${day.id}-${idx}`]}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <input
                          type="time"
                          value={serviceItem.endTime || ""}
                          onChange={(e) => {
                            const newServices = [...(day.services || [])];
                            newServices[idx] = {
                              ...newServices[idx],
                              endTime: e.target.value,
                            };
                            updateSetting(day.id, "services", newServices);
                          }}
                          className="p-2 rounded bg-dark-600 border border-dark-500"
                        />
                        {errors[`${day.id}-${idx}`] && (
                          <p className="text-red-500 text-sm">
                            {errors[`${day.id}-${idx}`]}
                          </p>
                        )}
                      </div>
                      {/* Optional: Delete service button */}
                      <button
                        onClick={() => {
                          const newServices = (day.services || []).filter(
                            (_, i) => i !== idx
                          );
                          updateSetting(day.id, "services", newServices);
                        }}
                        className="text-red-500"
                      >
                        حذف
                      </button>
                    </div>
                  ))}

                  {/* Add service button */}
                  <button
                    onClick={() => {
                      const newServices = day.services ? [...day.services] : [];
                      newServices.push({
                        serviceType: "",
                        startTime: "",
                        endTime: "",
                      });
                      updateSetting(day.id, "services", newServices);
                    }}
                    className="px-4 py-2 bg-blue-600 rounded text-white"
                  >
                    {t("addService")}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={saveSettings}
        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
      >
        {t("saveSettings")}
      </button>
    </div>
  );
};

export default TimeManagement;
