import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

let triggerUpdatePrompt;

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    triggerUpdatePrompt?.(true);
    updateSW(true);
  },
  onOfflineReady() {
    console.log("✅ التطبيق أصبح متاحًا بدون إنترنت");
  },
});

function UpdatePrompt() {
  const [show, setShow] = useState(false);
  console.log("Build version: 2025-07-12-A");

  useEffect(() => {
    triggerUpdatePrompt = setShow;
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white text-black px-4 py-2 rounded-lg shadow-lg z-50">
      <p className="mb-2">📦 يوجد تحديث جديد</p>
      <button
        onClick={() => {
          updateSW && updateSW(true);
        }}
        className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
      >
        تحديث الآن
      </button>
    </div>
  );
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <App />
      <UpdatePrompt />
    </>
  </StrictMode>
);
