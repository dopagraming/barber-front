import { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await api.post("api/auth/request-password-reset", {
        identifier,
      });
      setMessage(res.data.message);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-900">
      <form
        onSubmit={handleSubmit}
        className="bg-dark-800 shadow-lg p-8 rounded max-w-md w-full border border-dark-700"
      >
        <h2 className="text-xl font-semibold mb-4 text-primary-400">
          نسيت كلمة المرور{" "}
        </h2>
        <input
          type="text"
          placeholder="أدخل أسم المستخدم, رقم الهاتف أو الايميل "
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="border border-dark-600 bg-dark-700 text-white w-full p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded w-full"
        >
          إرسال رابط إعادة التعيين
        </button>
        {message && <p className="text-green-400 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}
