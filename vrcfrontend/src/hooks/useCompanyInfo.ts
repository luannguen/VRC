import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CompanyInfo {
  companyName: string;
  companyShortName?: string;
  companyDescription?: string;
  contactSection: {
    address: string;
    phone?: string;
    email?: string;
    hotline?: string;
    workingHours?: string;
    fax?: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    telegram?: string;
    zalo?: string;
  };
  maps?: {
    googleMapsEmbed?: string;
    latitude?: string;
    longitude?: string;  };
  logo?: {
    id: string;
    url: string;
    alt?: string;
  };
  additionalInfo?: any;
}

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyInfo = async () => {
    try {
      setIsLoading(true);
      
      // Check for cached data first (cache for 1 hour)
      const cachedData = localStorage.getItem('company-info-cache');
      const cacheTimestamp = localStorage.getItem('company-info-timestamp');
      
      if (cachedData && cacheTimestamp) {
        const isStale = Date.now() - parseInt(cacheTimestamp) > 3600000; // 1 hour
        
        if (!isStale) {
          // Use cached data if it's still fresh
          setCompanyInfo(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }
      }      // Fetch fresh data from API
      const response = await fetch(`${API_URL}/api/header-info`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the data and timestamp
      localStorage.setItem('company-info-cache', JSON.stringify(data));
      localStorage.setItem('company-info-timestamp', Date.now().toString());
      
      setCompanyInfo(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch company info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // If we have cached data, use it as fallback even if it's stale
      const cachedData = localStorage.getItem('company-info-cache');
      if (cachedData) {
        setCompanyInfo(JSON.parse(cachedData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  return { 
    companyInfo, 
    isLoading, 
    error,
    refetch: fetchCompanyInfo 
  };
};

export default useCompanyInfo;
