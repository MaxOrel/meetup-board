// Единый формат ошибки контракта: { statusCode, message, errors? }
export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: FieldError[];
}
