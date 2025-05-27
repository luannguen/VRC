import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMultilingualSEO } from '../hooks/useMultilingualSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ExamplePage: React.FC = () => {
  const { t } = useTranslation();
  
  // Use SEO hook to set page title and description
  useMultilingualSEO({
    titleKey: 'pages.home.title',
    descriptionKey: 'pages.home.description'
  });

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('hero.title' as any)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('hero.subtitle' as any)}</p>
          <p className="mt-4 text-sm text-gray-600">
            {t('pages.home.description' as any)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamplePage;
