import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Event {
  id: string;
  title: string;
  summary: string;
  content?: any; // Rich text content
  slug: string;
  publishStatus: string;
  status: string; // 'upcoming', 'ongoing', 'past'
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  eventType: string;
  featured: boolean;
  participants?: number;
  tags?: Array<{tag: string}>;
  featuredImage?: {
    id: string;
    url: string;
    alt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  docs: Event[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface UseEventsOptions {
  limit?: number;
  page?: number;
  sort?: string;
  where?: Record<string, any>;
}

export const useEvents = (options: UseEventsOptions = {}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    limit: options.limit || 10,
    totalPages: 0,
    page: options.page || 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (params: UseEventsOptions = {}) => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params.limit || options.limit) {
        queryParams.append('limit', String(params.limit || options.limit));
      }
      
      if (params.page || options.page) {
        queryParams.append('page', String(params.page || options.page));
      }
      
      if (params.sort || options.sort) {
        queryParams.append('sort', params.sort || options.sort);
      }
      
      // Handle where conditions
      const whereConditions = { ...options.where, ...params.where };
      if (Object.keys(whereConditions).length > 0) {
        queryParams.append('where', JSON.stringify(whereConditions));
      }
      
      // Make API request
      const url = `${API_URL}/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch events');
      }
      
      setEvents(data.data.docs);
      setPagination({
        totalDocs: data.data.totalDocs,
        limit: data.data.limit,
        totalPages: data.data.totalPages,
        page: data.data.page,
        hasPrevPage: data.data.hasPrevPage,
        hasNextPage: data.data.hasNextPage,
        prevPage: data.data.prevPage,
        nextPage: data.data.nextPage
      });
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [options.page, options.limit, options.sort]);

  return {
    events,
    pagination,
    isLoading,
    error,
    fetchEvents
  };
};

export const useEvent = (slug: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/api/events/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch event');
      }
      
      setEvent(data.data);
      setError(null);
    } catch (err) {
      console.error(`Failed to fetch event (${slug}):`, err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  return {
    event,
    isLoading,
    error,
    refetch: fetchEvent
  };
};

export default useEvents;
