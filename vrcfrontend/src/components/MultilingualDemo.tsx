import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MultilingualDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('common.language' as any)} Demo
            <LanguageSwitcher variant="select" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">{t('hero.title' as any)}</h2>
            <p className="text-gray-600">{t('hero.subtitle' as any)}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium">{t('common.home' as any)}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h3 className="font-medium">{t('common.about' as any)}</h3>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h3 className="font-medium">{t('common.services' as any)}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h3 className="font-medium">{t('common.contact' as any)}</h3>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{t('common.products' as any)}</h3>
            <div className="space-y-2">
              <p><strong>{t('products.category' as any)}:</strong> Example Category</p>
              <p><strong>{t('products.price' as any)}:</strong> $99.99</p>
              <p><strong>{t('products.availability' as any)}:</strong> {t('products.inStock' as any)}</p>
            </div>
          </div>

          <div className="mt-6">
            <LanguageSwitcher variant="button" className="justify-center" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultilingualDemo;
