// UpdatePrompt.jsx
import { useState } from "react";
import { registerSW } from "virtual:pwa-register";

export default function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const updateSW = registerSW({
    onNeedRefresh() {
      setUpdateAvailable(true);
    },
    onOfflineReady() {
      console.log("✅ App ready offline");
    },
  });

  const reload = () => {
    updateSW(); // calls skipWaiting()
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white text-black px-4 py-2 rounded-lg shadow-lg z-50">
      <p className="mb-2">🚀 تحديث جديد متاح</p>
      <button
        onClick={reload}
        className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
      >
        تحديث الآن
      </button>
    </div>
  );
}
