import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HeaderInfo {
  companyName: string;
  companyShortName?: string;
  contactSection: {
    phone?: string;
    hotline?: string;
    email?: string;
    address?: string;
    workingHours?: string;
  };
  socialMedia: {
    facebook?: string;
    zalo?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    telegram?: string;
  };
  logo?: {
    id: string;
    url: string;
    alt?: string;
  };
  navigation?: {
    mainLinks: Array<{title: string, routeKey: string}>;
    moreLinks: Array<{title: string, routeKey: string}>;
  };
}

export const useHeaderInfo = () => {
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeaderInfo = async () => {
    try {
      setIsLoading(true);
      
      // Check for cached data first (cache for 1 hour)
      const cachedData = localStorage.getItem('header-info-cache');
      const cacheTimestamp = localStorage.getItem('header-info-timestamp');
      
      if (cachedData && cacheTimestamp) {
        const isStale = Date.now() - parseInt(cacheTimestamp) > 3600000; // 1 hour
        
        if (!isStale) {
          // Use cached data if it's still fresh
          setHeaderInfo(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }
      }
      
      // Fetch fresh data from API
      const response = await fetch(`${API_URL}/api/header-info`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the data and timestamp
      localStorage.setItem('header-info-cache', JSON.stringify(data));
      localStorage.setItem('header-info-timestamp', Date.now().toString());
      
      setHeaderInfo(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch header info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // If we have cached data, use it as fallback even if it's stale
      const cachedData = localStorage.getItem('header-info-cache');
      if (cachedData) {
        setHeaderInfo(JSON.parse(cachedData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaderInfo();
  }, []);

  return { 
    headerInfo, 
    isLoading, 
    error,
    refetch: fetchHeaderInfo 
  };
};

export default useHeaderInfo;
