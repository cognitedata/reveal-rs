export interface SdkError {
  status: number;
  message: string;
  errorMessage?: string;
  missing?: Record<string, string>[];
  duplicated?: Record<string, string>[];
  statuses?: number[];
  errors: {
    status: number;
    message: string;
    errorMessage?: string;
    missing: Record<string, string>[];
  }[];
  failed: Record<string, string>[];
  stack?: unknown;
}

export type ErrorType =
  | 'UNKNOWN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SERVER_ERROR'
  | 'NOT_AUTHORIZED'
  | 'NOT_AUTHENTICATED'
  | 'BREAKING_CHANGE';
export class PlatypusError {
  message: string;
  code?: number;
  type: ErrorType;
  stack?: unknown;

  constructor(
    message: string,
    type: ErrorType,
    code?: number,
    stack?: unknown
  ) {
    this.message = message;
    this.type = type as ErrorType;
    if (code) this.code = code;

    if (stack) {
      this.stack = stack;
    }
  }

  static fromSdkError(err: SdkError): PlatypusError {
    const platypusErrorMsg = new PlatypusError(
      err.message as string,
      'UNKNOWN',
      err.status,
      err.stack
    );

    const scopedMsg =
      err.errors && err.errors.length === 1
        ? err.errors[0].errorMessage
          ? err.errors[0].errorMessage
          : err.errors[0].message
        : err.message;

    switch (err.status) {
      case 400: {
        if (err.errorMessage && err.errorMessage.includes('breaking changes')) {
          platypusErrorMsg.message = err.errorMessage;
          platypusErrorMsg.type = 'BREAKING_CHANGE';
          break;
        }
        if (err.missing) {
          platypusErrorMsg.message = scopedMsg;
          platypusErrorMsg.type = 'NOT_FOUND';
          break;
        }
        platypusErrorMsg.message = err.errorMessage
          ? err.errorMessage
          : scopedMsg;
        platypusErrorMsg.type = 'VALIDATION';
        break;
      }
      case 401: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'NOT_AUTHENTICATED';
        break;
      }
      case 403: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'NOT_AUTHORIZED';
        break;
      }
      case 404: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'NOT_FOUND';
        break;
      }
      case 409: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'VALIDATION';
        break;
      }
      case 500: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'SERVER_ERROR';
        break;
      }
      default: {
        platypusErrorMsg.message = err.message;
        platypusErrorMsg.type = 'UNKNOWN';
        break;
      }
    }

    return platypusErrorMsg;
  }

  toString(): string {
    return this.message;
  }
}
