import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post(`/api/auth/reset-password/${token}`, { newPassword });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-900">
      <form
        onSubmit={handleSubmit}
        className="bg-dark-800 shadow-lg p-8 rounded max-w-md w-full border border-dark-700"
      >
        <h2 className="text-xl font-semibold mb-4 text-primary-400">
          إعادة تعيين كلمة المرور
        </h2>
        <input
          type="password"
          placeholder="أدخل كلمة المرور الجديد"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border border-dark-600 bg-dark-700 text-white w-full p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
        <input
          type="password"
          placeholder="أعد أدخال كلمة المرور الجديد"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border border-dark-600 bg-dark-700 text-white w-full p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded w-full"
        >
          إعادة تعيين كلمة المرور
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}
