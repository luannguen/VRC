import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HomepageData {
  companyInfo: {
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
  };
  header: any;
  footer: any;
  navigation: Array<any>;
  featuredProducts: Array<any>;
  featuredServices: Array<any>;
  featuredProjects: Array<any>;
  technologies: Array<any>;
  recentPosts: Array<any>;
  upcomingEvents: Array<any>;
}

export const useHomepage = () => {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageData = async () => {
    try {
      setIsLoading(true);
        // Check for cached data first (cache for 15 minutes)
      const cachedData = localStorage.getItem('homepage-data-cache');
      const cacheTimestamp = localStorage.getItem('homepage-data-timestamp');
      
      if (cachedData && cacheTimestamp) {
        try {
          const isStale = Date.now() - parseInt(cacheTimestamp) > 900000; // 15 minutes
          
          if (!isStale) {
            // Use cached data if it's still fresh
            const parsedData = JSON.parse(cachedData);
            if (parsedData) {
              setHomepageData(parsedData);
              setIsLoading(false);
              return;
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse cached homepage data, clearing cache:', parseError);
          localStorage.removeItem('homepage-data-cache');
          localStorage.removeItem('homepage-data-timestamp');
        }
      }
      
      // Fetch fresh data from API
      const response = await fetch(`${API_URL}/api/homepage`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch homepage data');
      }
        // Cache the data and timestamp
      if (data.data) {
        localStorage.setItem('homepage-data-cache', JSON.stringify(data.data));
        localStorage.setItem('homepage-data-timestamp', Date.now().toString());
      }
      
      setHomepageData(data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch homepage data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
        // If we have cached data, use it as fallback even if it's stale
      const cachedData = localStorage.getItem('homepage-data-cache');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (parsedData) {
            setHomepageData(parsedData);
          }
        } catch (parseError) {
          console.warn('Failed to parse fallback cached data:', parseError);
          localStorage.removeItem('homepage-data-cache');
          localStorage.removeItem('homepage-data-timestamp');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  return {
    homepageData,
    isLoading,
    error,
    refetch: fetchHomepageData
  };
};

export default useHomepage;
