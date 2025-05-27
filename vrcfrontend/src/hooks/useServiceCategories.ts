import { useState, useEffect } from 'react';

export interface ServiceCategory {
  id: string;
  title: string;
  description?: string;
  slug: string;
}

interface ServiceCategoriesData {
  categories: ServiceCategory[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseServiceCategoriesReturn {
  categoriesData: ServiceCategoriesData | null;
  isLoading: boolean;
  error: string | null;
  clearCacheAndRefresh: () => void;
}

const CACHE_KEY = 'service_categories_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useServiceCategories = (limit: number = 5): UseServiceCategoriesReturn => {
  const [categoriesData, setCategoriesData] = useState<ServiceCategoriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearCacheAndRefresh = () => {
    localStorage.removeItem(CACHE_KEY);
    fetchServiceCategories();
  };

  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          console.log('Using cached service categories data');
          return data;
        } else {
          console.log('Service categories cache expired, removing...');
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error reading service categories cache:', error);
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  };

  const setCachedData = (data: ServiceCategoriesData) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('Service categories data cached successfully');
    } catch (error) {
      console.error('Error caching service categories data:', error);
    }
  };

  const fetchServiceCategories = async () => {
    console.log('Fetching service categories from API...');
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedData = getCachedData();
      if (cachedData) {
        setCategoriesData(cachedData);
        setIsLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const url = `${apiUrl}/api/service-categories?limit=${limit}&sort=title`;

      console.log('Service categories API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Service categories API response:', result);

      // Transform the data to match our interface
      const transformedData: ServiceCategoriesData = {
        categories: result.docs || [],
        pagination: {
          total: result.totalDocs || 0,
          page: result.page || 1,
          pages: result.totalPages || 1,
          limit: result.limit || limit,
          hasNext: result.hasNextPage || false,
          hasPrev: result.hasPrevPage || false,
        }
      };

      setCategoriesData(transformedData);
      setCachedData(transformedData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching service categories:', errorMessage);
      setError(errorMessage);

      // Try to use stale cache as fallback
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const { data } = JSON.parse(cachedData);
          console.log('Using stale cache as fallback for service categories');
          setCategoriesData(data);
        } catch (cacheError) {
          console.error('Error parsing stale cache:', cacheError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceCategories();
  }, [limit]);

  return {
    categoriesData,
    isLoading,
    error,
    clearCacheAndRefresh
  };
};
