import en from "@/locales/en.json";
import ur from "@/locales/ur.json";

export const translations = {
  en,
  ur
};

export const getTranslation = (locale) => {
  return translations[locale] || translations.en;
};