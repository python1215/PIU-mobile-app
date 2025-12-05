import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, languages } from '../i18n';
import { FiGlobe, FiCheck } from 'react-icons/fi';

const LanguageSelector = memo(function LanguageSelector({ variant = 'button' }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  if (variant === 'buttons') {
    return (
      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group" role="group" aria-label={t('common.selectLanguage')}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`btn ${
                i18n.language === lang.code 
                  ? 'btn-primary' 
                  : 'btn-outline-primary bg-white'
              } d-flex align-items-center gap-2 px-3 py-2`}
              style={{ 
                minWidth: '110px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
              <span className="fw-medium" style={{ fontSize: '0.85rem' }}>{lang.name}</span>
              {i18n.language === lang.code && <FiCheck size={14} />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="position-relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline-secondary w-100 d-flex align-items-center gap-2"
        style={{ fontSize: '0.85rem' }}
      >
        <FiGlobe size={16} />
        <span>{currentLang.flag}</span>
        <span className="flex-grow-1 text-start">{currentLang.name}</span>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="position-fixed top-0 start-0 w-100 h-100" 
            style={{ zIndex: 1050 }}
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="position-absolute bottom-100 start-0 end-0 mb-1 bg-white rounded-3 shadow-lg border overflow-hidden"
            style={{ zIndex: 1051 }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-100 d-flex align-items-center gap-2 px-3 py-2 border-0 text-start ${
                  i18n.language === lang.code ? 'bg-primary text-white' : 'bg-white text-dark'
                }`}
                style={{ fontSize: '0.85rem' }}
              >
                <span>{lang.flag}</span>
                <span className="flex-grow-1">{lang.name}</span>
                {i18n.language === lang.code && <FiCheck size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default LanguageSelector;
