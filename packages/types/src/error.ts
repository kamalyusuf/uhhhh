export interface ErrorProps {
  message: string;
  path?: string;
}

export interface ApiError {
  errors: ErrorProps[];
}

export type ErrorStatus = 400 | 401 | 403 | 404 | 422 | 429 | 500;
