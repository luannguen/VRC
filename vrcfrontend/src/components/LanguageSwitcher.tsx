import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

interface LanguageSwitcherProps {
  variant?: 'select' | 'button';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'select', 
  className = '' 
}) => {
  const { i18n, t } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  if (variant === 'button') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage.code === language.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange(language.code)}
            className="gap-2"
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Select value={currentLanguage.code} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-[180px] ${className}`}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue placeholder={t('common.language' as any)} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
