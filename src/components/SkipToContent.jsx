import { useLanguage } from "../contexts/LanguageContext";

const SkipToContent = () => {
  const { t } = useLanguage();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-500 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
    >
      {t("skipToContent") || "تخطي إلى المحتوى الرئيسي"}
    </a>
  );
};

export default SkipToContent;
