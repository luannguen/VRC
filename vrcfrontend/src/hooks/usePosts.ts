import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Post {
  id: string;
  title: string;
  content?: any; // Rich text content
  slug: string;
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  categories?: Array<{
    id: string;
    title: string;
  }>;
  heroImage?: {
    id: string;
    url: string;
    alt?: string;
  };
  meta?: {
    title?: string;
    description?: string;
    image?: any;
  };
  author?: string;
  summary?: string;
}

export interface PostsResponse {
  docs: Post[];
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

interface UsePostsOptions {
  limit?: number;
  page?: number;
  sort?: string;
  where?: Record<string, any>;
}

export const usePosts = (options: UsePostsOptions = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
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

  const fetchPosts = async (params: UsePostsOptions = {}) => {
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
      const url = `${API_URL}/api/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch posts');
      }
      
      setPosts(data.data.docs);
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
      console.error('Failed to fetch posts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [options.page, options.limit, options.sort]);

  return {
    posts,
    pagination,
    isLoading,
    error,
    fetchPosts
  };
};

export const usePost = (slug: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/api/posts/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch post');
      }
      
      setPost(data.data);
      setError(null);
    } catch (err) {
      console.error(`Failed to fetch post (${slug}):`, err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  return {
    post,
    isLoading,
    error,
    refetch: fetchPost
  };
};

export default usePosts;
