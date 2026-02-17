import React from 'react'

function LanguageSelector({ activeLanguage, onLanguageChange }) {
  const languages = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'Go', 'Rust']

  return (
    <div className="lang-pills">
      {languages.map(lang => (
        <span 
          key={lang}
          className={`lang-pill ${activeLanguage === lang ? 'active' : ''}`}
          onClick={() => onLanguageChange(lang)}
        >
          {lang}
        </span>
      ))}
    </div>
  )
}

export default LanguageSelector
