import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("يوجد إصدار جديد، هل تريد التحديث؟")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("التطبيق أصبح متاحًا بدون إنترنت!");
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
