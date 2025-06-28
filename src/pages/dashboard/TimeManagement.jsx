// Updated TimeManagement.jsx
import { useEffect, useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const days = [
  { id: "sunday", name: "الأحد" },
  { id: "monday", name: "الاثنين" },
  { id: "tuesday", name: "الثلاثاء" },
  { id: "wednesday", name: "الأربعاء" },
  { id: "thursday", name: "الخميس" },
  { id: "friday", name: "الجمعة" },
  { id: "saturday", name: "السبت" },
];

const TimeManagement = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewDate, setPreviewDate] = useState("");
  const [slotsPreview, setSlotsPreview] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("api/time-management/settings");
      console.log();
      setSettings(res.data);
    } catch (err) {
      console.log(err);

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

  const updateBreakTime = (key, value) => {
    setSettings({
      ...settings,
      breakTime: {
        ...settings.breakTime,
        [key]: value,
      },
    });
  };

  const saveSettings = async () => {
    try {
      await api.put("api/time-management/settings", settings);
      toast.success("تم حفظ الإعدادات");
    } catch (err) {
      toast.error("فشل في حفظ الإعدادات");
    }
  };

  const fetchPreviewSlots = async () => {
    if (!previewDate) return;
    try {
      const res = await api.get(`api/time-management/slots/${previewDate}`);
      setSlotsPreview(res.data);
    } catch (err) {
      toast.error("فشل في جلب المواعيد");
    }
  };

  if (loading || !settings)
    return <div className="text-white p-4">...تحميل</div>;

  return (
    <div className="text-white p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">إعدادات أوقات العمل</h2>

      <div className="space-y-4">
        {settings.workingDays.map((day) => (
          <div
            key={day.id}
            className="bg-dark-700 p-4 rounded-lg space-y-2 border border-dark-600"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{day.name}</span>
              <label className="flex items-center space-x-2 space-x-reverse">
                <span>تفعيل</span>
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
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="time"
                  value={day.openTime}
                  onChange={(e) =>
                    updateSetting(day.id, "openTime", e.target.value)
                  }
                  className="p-2 rounded bg-dark-600 border border-dark-500"
                />
                <input
                  type="time"
                  value={day.closeTime}
                  onChange={(e) =>
                    updateSetting(day.id, "closeTime", e.target.value)
                  }
                  className="p-2 rounded bg-dark-600 border border-dark-500"
                />
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={day.slotDuration}
                  onChange={(e) =>
                    updateSetting(
                      day.id,
                      "slotDuration",
                      parseInt(e.target.value)
                    )
                  }
                  className="p-2 rounded bg-dark-600 border border-dark-500"
                  placeholder="مدة الموعد بالدقائق"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-dark-700 p-4 rounded-lg border border-dark-600">
        <h3 className="font-semibold mb-2">وقت الاستراحة</h3>
        <label className="flex items-center space-x-2 space-x-reverse mb-2">
          <span>تفعيل</span>
          <input
            type="checkbox"
            checked={settings.breakTime.enabled}
            onChange={(e) => updateBreakTime("enabled", e.target.checked)}
          />
        </label>
        {settings.breakTime.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              value={settings.breakTime.startTime}
              onChange={(e) => updateBreakTime("startTime", e.target.value)}
              className="p-2 rounded bg-dark-600 border border-dark-500"
            />
            <input
              type="time"
              value={settings.breakTime.endTime}
              onChange={(e) => updateBreakTime("endTime", e.target.value)}
              className="p-2 rounded bg-dark-600 border border-dark-500"
            />
          </div>
        )}
      </div>

      <button
        onClick={saveSettings}
        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
      >
        حفظ الإعدادات
      </button>
    </div>
  );
};

export default TimeManagement;
