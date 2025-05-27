import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ServiceData {
  id: string;
  title: string;
  slug: string;
  type: string;
  summary: string;
  featured: boolean;
  featuredImage?: {
    id: string;
    url: string;
    alt?: string;
    filename?: string;
    mimeType?: string;
    width?: number;
    height?: number;
  };
  content?: any;
  features?: any[];
  benefits?: any[];
  pricing?: {
    showPricing: boolean;
    priceType: string;
    customPrice?: string;
    currency?: string;
  };
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const useServices = (limit: number = 20) => {
  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicesData = async () => {
    try {
      setIsLoading(true);
      
      // Check for cached data first (cache for 15 minutes)
      const cacheKey = `services-${limit}-cache`;
      const timestampKey = `services-${limit}-timestamp`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(timestampKey);
      
      if (cachedData && cacheTimestamp) {
        try {
          const isStale = Date.now() - parseInt(cacheTimestamp) > 900000; // 15 minutes
          
          if (!isStale) {
            const parsedData = JSON.parse(cachedData);
            if (parsedData) {
              setServicesData(parsedData);
              setIsLoading(false);
              return;
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse cached services data, clearing cache:', parseError);
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(timestampKey);
        }
      }      // Fetch fresh data from API
      const response = await fetch(`${API_URL}/api/services?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch services data');
      }

      // Extract services from nested data structure
      const servicesArray = result.data?.services || [];

      // Cache the data and timestamp
      if (servicesArray.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(servicesArray));
        localStorage.setItem(timestampKey, Date.now().toString());
      }

      setServicesData(servicesArray);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch services data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // If we have cached data, use it as fallback even if it's stale
      const cacheKey = `services-${limit}-cache`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (parsedData) {
            setServicesData(parsedData);
          }        } catch (parseError) {
          console.warn('Failed to parse fallback cached data:', parseError);
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`services-${limit}-timestamp`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, [limit]);

  return {
    servicesData,
    isLoading,
    error,
    refetch: fetchServicesData
  };
};
