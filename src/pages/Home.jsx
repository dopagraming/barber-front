import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Scissors,
  Clock,
  Users,
  Star,
  Calendar,
  CheckCircle,
  Award,
  MapPin,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

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
              جاهز لتجربة أفضل حلاقة؟
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              احجز موعدك الآن واستمتع بخدمة استثنائية
            </p>
            <div className="flex flex-col text-center items-center gap-2 ">
              <Link
                to={user ? "/booking" : "/login"}
                className="bg-white w-fit text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                <Calendar className="w-5 h-5 ml-2" />
                {user ? "حجز موعد" : "تسجيل الدخول"}
              </Link>
              <Link
                to={user ? "/profile" : "/register"}
                className="bg-white w-fit text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                <Calendar className="w-5 h-5 ml-2" />
                {user ? "حجوزاتي" : "إنشاء حساب جديد"}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
