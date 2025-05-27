import { useState, useEffect } from 'react';

export interface FooterNavItem {
  link: {
    type: 'custom' | 'reference';
    newTab?: boolean;
    url?: string;
    label: string;
  };
  id: string;
}

export interface FooterData {
  id: string;
  globalType: 'footer';
  navItems: FooterNavItem[];
  createdAt: string;
  updatedAt: string;
}

export const useFooter = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const clearCacheAndRefresh = () => {
    // Clear footer cache
    const footerCacheKey = 'footer-data-cache';
    const footerTimestampKey = 'footer-data-timestamp';
    localStorage.removeItem(footerCacheKey);
    localStorage.removeItem(footerTimestampKey);
    
    // Clear service categories cache
    const servicesCacheKey = 'service_categories_cache';
    const servicesTimestampKey = 'service_categories_timestamp';
    localStorage.removeItem(servicesCacheKey);
    localStorage.removeItem(servicesTimestampKey);
    
    // Trigger refresh
    setRefreshTrigger(prev => prev + 1);
    
    console.log('Cleared all footer and service categories cache');
  };

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check localStorage cache first (cache for 30 minutes)
        const cacheKey = 'footer-data-cache';
        const cacheTimestampKey = 'footer-data-timestamp';
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
        
        if (cachedData && cacheTimestamp) {
          const isStale = Date.now() - parseInt(cacheTimestamp) > 30 * 60 * 1000; // 30 minutes
          
          if (!isStale) {
            try {
              const parsedData = JSON.parse(cachedData);
              setFooterData(parsedData);
              setIsLoading(false);
              return;
            } catch (parseError) {
              console.warn('Failed to parse cached footer data:', parseError);
              // Continue to fetch fresh data
            }
          }
        }

        // Fetch fresh data from API
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/globals/footer`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch footer data: ${response.status} ${response.statusText}`);
        }

        const data: FooterData = await response.json();
        
        // Update state
        setFooterData(data);
        
        // Cache the data
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(cacheTimestampKey, Date.now().toString());
        } catch (cacheError) {
          console.warn('Failed to cache footer data:', cacheError);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch footer data';
        console.error('Footer data fetch error:', err);
        setError(errorMessage);
        
        // Try to use cached data even if stale
        const cachedData = localStorage.getItem('footer-data-cache');
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            setFooterData(parsedData);
            console.info('Using stale cached footer data due to fetch error');
          } catch (parseError) {
            console.warn('Failed to parse stale cached footer data:', parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }    };

    fetchFooterData();
  }, [refreshTrigger]);

  return {
    footerData,
    isLoading,
    error,
    clearCacheAndRefresh,
  };
};
