export interface ErrorProps {
  message: string;
  path?: string;
}

export interface ApiError {
  errors: ErrorProps[];
}
