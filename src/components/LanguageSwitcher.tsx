import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLanguage);
  };

  const currentLanguage = i18n.language === 'zh' ? 'zh' : 'en';
  const nextLanguage = currentLanguage === 'zh' ? 'en' : 'zh';

  return (
    <Button
      variant="outline"
      onClick={toggleLanguage}
      className="flex items-center space-x-2 input-enhanced whitespace-nowrap"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{t(`language.${nextLanguage}`)}</span>
    </Button>
  );
};

export default LanguageSwitcher;
