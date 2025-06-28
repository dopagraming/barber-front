import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ServiceSelection from "../components/booking/ServiceSelection";
import BarberSelection from "../components/booking/BarberSelection";
import DateTimeSelection from "../components/booking/DateTimeSelection";
import RepeatOptions from "../components/booking/RepeatOptions";
import BookingConfirmation from "../components/booking/BookingConfirmation";
import BookingSuccess from "../components/booking/BookingSuccess";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const BookingSystem = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [bookingData, setBookingData] = useState({
    service: null,
    barber: null,
    date: null,
    time: null,
    peopleCount: 1,
    notes: "",
    isRepeating: false,
    repeatConfig: {
      interval: 1,
      unit: "week",
      occurrences: 4,
    },
    totalAppointments: 1,
    totalCost: 0,
  });

  const updateBookingData = (data) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep === 2 && !bookingData.isRepeating) {
      setCurrentStep((prev) => prev + 2);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 4 && !bookingData.isRepeating) {
      setCurrentStep((prev) => prev - 2);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const steps = [
    { number: 1, title: t("selectService"), component: ServiceSelection },
    { number: 2, title: t("selectDateAndTime"), component: DateTimeSelection },
    { number: 3, title: t("repeatOptions"), component: RepeatOptions },
    {
      number: 4,
      title: t("bookingConfirmation"),
      component: BookingConfirmation,
    },
    { number: 5, title: t("bookingComplete"), component: BookingSuccess },
  ];

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="min-h-screen py-20 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p
          className="text-gray-400 mb-5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          {t("mainPage")}
        </p>
        {/* Progress Bar */}
        {currentStep < 6 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {steps.slice(0, 5).map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep >= step.number
                        ? "bg-primary-500 text-white"
                        : "bg-dark-700 text-gray-400"
                    }`}
                  >
                    {step.number}
                  </div>
                  {index < 4 && (
                    <div
                      className={`h-1 w-16 mx-2 transition-all ${
                        currentStep > step.number
                          ? "bg-primary-500"
                          : "bg-dark-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-gray-400">
                {t("step")} {currentStep} {t("of")} {steps.length - 1}
              </p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={bookingData}
                updateData={updateBookingData}
                onNext={nextStep}
                onPrev={prevStep}
                goToStep={goToStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingSystem;
