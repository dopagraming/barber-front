import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Star, Users, Plus, Minus } from "lucide-react";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../lib/axios";

const ServiceSelection = ({ data, updateData, onNext }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [peopleCount, setPeopleCount] = useState(data.peopleCount || 1);
  const { t } = useLanguage();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get("api/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    updateData({ service, peopleCount });
  };

  const handlePeopleCountChange = (newCount) => {
    if (newCount >= 1 && newCount <= 10) {
      setPeopleCount(newCount);
      updateData({ peopleCount: newCount });
    }
  };

  const handleContinue = () => {
    if (data.service) {
      onNext();
    }
  };

  const filteredServices = Array.isArray(services)
    ? selectedCategory === "all"
      ? services
      : services.filter((service) => service.category === selectedCategory)
    : [];

  const getTotalPrice = () => {
    return data.service ? data.service.price * peopleCount : 0;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-dark-800/50 rounded-2xl p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">
          {t("selectRequiredService")}
        </h3>
      </div>

      {/* People Count Selector */}
      <div className="bg-dark-700/50 rounded-lg p-6 mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 ml-2" />
          {t("numberOfPeople")}
        </h4>
        <div className="flex items-center justify-center space-x-4 space-x-reverse">
          <button
            onClick={() => handlePeopleCountChange(peopleCount - 1)}
            disabled={peopleCount <= 1}
            className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{peopleCount}</div>
            <div className="text-gray-400 text-sm">
              {peopleCount === 1
                ? t("onePerson")
                : `${peopleCount} ${t("people")}`}
            </div>
          </div>
          <button
            onClick={() => handlePeopleCountChange(peopleCount + 1)}
            disabled={peopleCount >= 10}
            className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {peopleCount > 1 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm text-center">
              {t("pricePerPerson")}
            </p>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {filteredServices?.map((service, index) => (
          <motion.div
            key={service._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => handleServiceSelect(service)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
              data.service?._id === service._id
                ? "border-primary-500 bg-primary-500/10"
                : "border-dark-600 bg-dark-700/50 hover:border-primary-500/50"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-white font-semibold text-lg">
                {service.nameAr}
              </h4>
              <div className="text-right">
                <div className="text-primary-500 font-bold text-lg">
                  {service.price} {t("currency")}
                </div>
                {peopleCount > 1 && (
                  <div className="text-gray-400 text-sm">
                    {service.price * peopleCount} {t("currency")} للجميع
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {service.descriptionAr}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-400 text-sm">
                <Clock className="w-4 h-4 ml-1" />
                <span>
                  {service.duration} {t("minutes")}
                </span>
              </div>

              {service.popularity > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current ml-1" />
                  <span className="text-yellow-500 text-sm">
                    {t("popularService")}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">{t("noServicesAvailable")}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!data.service}
          className={`px-8 py-3 rounded-lg font-semibold transition-all ${
            data.service
              ? "bg-primary-500 hover:bg-primary-600 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

export default ServiceSelection;
