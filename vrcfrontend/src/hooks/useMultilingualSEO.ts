import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

interface SEOProps {
  titleKey?: string;
  descriptionKey?: string;
  title?: string;
  description?: string;
}

export const useMultilingualSEO = ({ titleKey, descriptionKey, title, description }: SEOProps) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Update document title
    const documentTitle = title || (titleKey ? t(titleKey as any) : '');
    if (documentTitle) {
      document.title = documentTitle;
    }

    // Update meta description
    const metaDescription = description || (descriptionKey ? t(descriptionKey as any) : '');
    if (metaDescription) {
      const metaTag = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (metaTag) {
        metaTag.content = metaDescription;
      } else {
        const newMetaTag = document.createElement('meta');
        newMetaTag.name = 'description';
        newMetaTag.content = metaDescription;
        document.head.appendChild(newMetaTag);
      }
    }

    // Update html lang attribute
    document.documentElement.lang = i18n.language;
  }, [title, description, titleKey, descriptionKey, t, i18n.language]);
};

// Hook for page-specific translations
export const usePageTranslations = (pageKey: string) => {
  const { t } = useTranslation();
  
  return {
    title: t(`pages.${pageKey}.title` as any),
    description: t(`pages.${pageKey}.description` as any),
  };
};
