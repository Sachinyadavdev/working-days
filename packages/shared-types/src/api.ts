// ============================================================
// Standardized API Response Types
// ============================================================

/** Paginated response metadata */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Standardized API success response */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  message?: string;
  timestamp: string;
}

/** Standardized API error response */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
  correlationId?: string;
}

/** Pagination query parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/** Auth tokens returned after login/refresh */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Authenticated user payload (from JWT) */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}
