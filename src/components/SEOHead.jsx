import { Helmet } from "react-helmet-async";
import { useLanguage } from "../contexts/LanguageContext";

const SEOHead = ({
  title,
  description,
  keywords,
  image = "/logo.png",
  url = window.location.href,
  type = "website",
}) => {
  const { language, direction } = useLanguage();

  const defaultTitles = {
    ar: "Ali Barber Shop - أفضل صالون حلاقة في المدينة",
    en: "Ali Barber Shop - Best Barber Shop in Town",
    he: "Ali Barber Shop - מספרה הטובה ביותר בעיר",
  };

  const defaultDescriptions = {
    ar: "احجز موعدك في أفضل صالون حلاقة. خدمات متميزة في قص الشعر وتهذيب اللحية وعلاجات الشعر.",
    en: "Book your appointment at the best barber shop. Premium services in haircuts, beard trimming, and hair treatments.",
    he: "קבע תור במספרה הטובה ביותר. שירותים מובחרים בתספורות, עיצוב זקן וטיפולי שיער.",
  };

  const pageTitle = title || defaultTitles[language];
  const pageDescription = description || defaultDescriptions[language];

  return (
    <Helmet>
      <html lang={language} dir={direction} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta
        property="og:locale"
        content={
          language === "ar" ? "ar_SA" : language === "he" ? "he_IL" : "en_US"
        }
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Alternate languages */}
      <link
        rel="alternate"
        hrefLang="ar"
        href={url.replace(/\/(en|he)\//, "/ar/")}
      />
      <link
        rel="alternate"
        hrefLang="en"
        href={url.replace(/\/(ar|he)\//, "/en/")}
      />
      <link
        rel="alternate"
        hrefLang="he"
        href={url.replace(/\/(ar|en)\//, "/he/")}
      />
      <link
        rel="alternate"
        hrefLang="x-default"
        href={url.replace(/\/(en|he)\//, "/ar/")}
      />
    </Helmet>
  );
};

export default SEOHead;
