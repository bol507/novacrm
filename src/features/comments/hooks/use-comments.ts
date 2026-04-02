import { useQuery, type UseQueryOptions,  } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { commentService } from '@/features/comments/services/commentService';
import type { CommentResponse } from '../types/comment';
import type { ApiErrorResponse } from '@/shared/types/api-error';

export interface CommentsQueryOptions {
  page?: number;
  perPage?: number;
  orderBy?: 'createdtime' | 'modifiedtime';
  sortOrder?: 'ASC' | 'DESC';
}

export const useComments = (
  module: string,
  relatedId: number,
  customOptions: CommentsQueryOptions = {},  
  queryOptions?: Omit<                      
    UseQueryOptions<CommentResponse, AxiosError<ApiErrorResponse>>,
    'queryKey' | 'queryFn'
  >
) => {
  const {
    page = 1,
    perPage = 50,
    orderBy = 'createdtime',
    sortOrder = 'DESC',
  } = customOptions;

  return useQuery<CommentResponse, AxiosError<ApiErrorResponse>>({
    queryKey: ['comments', module, relatedId, { page, perPage, orderBy, sortOrder }],
    queryFn: async ({ signal }) => {
      if (signal?.aborted) throw new Error('Request cancelled');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        order: orderBy,
        sort: sortOrder,
      });
      
      const response = await commentService.getComments(
        module,
        relatedId,
        params,
        signal
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    enabled: !!module && relatedId > 0,
    ...queryOptions, 
  });
};

/**
 * Extract comments array from query response
 * 
 * @param response - The query response containing CommentResponse
 * @returns Array of comments or empty array if undefined
 */
export const selectComments = (response?: CommentResponse) => response?.data ?? [];

/**
 * Extract pagination metadata from query response
 * 
 * @param response - The query response containing CommentResponse
 * @returns Pagination metadata or default values
 */
export const selectCommentsMeta = (response?: CommentResponse) => response?.meta ?? {
  current_page: 1,
  per_page: 50,
  total: 0,
  last_page: 1,
  has_more: false,
};

/**
 * Check if there are any comments
 * 
 * @param response - The query response
 * @returns true if there is at least one comment
 */
export const selectHasComments = (response?: CommentResponse): boolean => {
  return (response?.data?.length ?? 0) > 0;
};