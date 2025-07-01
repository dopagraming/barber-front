import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const Home = () => {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const validatePhone = (value) => {
    const phoneRegex = /^05\d{8}$/;
    if (!value) return t("phoneRequired");
    if (!phoneRegex.test(value)) return t("phoneInvalid");
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validatePhone(phone);
    if (validationError) {
      setError(validationError);
    } else {
      setError("");
      try {
        await api.put("api/users/profile", { phone });
        await refreshUser();
        setPhone("");
        toast.success(t("phoneUpdatedSuccess"));
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  if (user) {
    if (!user?.phone)
      return (
        <form
          onSubmit={handleSubmit}
          className="max-w-sm mx-auto mt-10 bg-dark-800 p-6 rounded-lg"
        >
          <label htmlFor="phone" className="block text-white font-medium mb-2">
            {t("enterPhoneNumber")}
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phoneExample")}
            className="w-full px-4 py-2 rounded-lg border border-dark-600 bg-dark-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          <button
            type="submit"
            className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition"
          >
            {t("send")}
          </button>
        </form>
      );
  }

  return (
    <div className="min-h-screen ">
      {/* CTA Section */}
      <section className="py-20 relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("readyForBestHaircut")}
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              {t("bookNowEnjoyService")}
            </p>
            <div className="flex flex-col text-center items-center gap-2 ">
              <Link
                to={user ? "/booking" : "/login"}
                className="bg-white w-fit text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                <Calendar className="w-5 h-5 ml-2" />
                {user ? t("booking") : t("login")}
              </Link>
              <Link
                to={user ? "/profile" : "/register"}
                className="bg-white w-fit text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                <Calendar className="w-5 h-5 ml-2" />
                {user ? t("myBookings") : t("createNewAccount")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
