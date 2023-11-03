import { Form } from 'antd';
import _ from 'lodash';
import { isStringEmpty } from '~/utils/validations';

export type ValidateStatus = Parameters<typeof Form.Item>[0]['validateStatus'];
export interface InputWithValidation {
  value: string;
  validateStatus?: ValidateStatus;
  errorMsg?: string | null;
}

export const validateConnectionName = (
  value: string,
): { validateStatus: ValidateStatus; errorMsg: string | null } => {
  if (isStringEmpty(value)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Connection Name is required',
    };
  }
  if (value.length < 4) {
    return {
      validateStatus: 'error',
      errorMsg: 'Minimum 4 characters',
    };
  }
  if (value.length > 36) {
    return {
      validateStatus: 'error',
      errorMsg: 'Maximum 36 characters',
    };
  }
  if (!value.match(/^[a-zA-Z0-9 _-]*$/)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Invalid connection name',
    };
  }
  return {
    validateStatus: 'success',
    errorMsg: '',
  };
};

export const validateHostName = (
  value: string,
): { validateStatus: ValidateStatus; errorMsg: string | null } => {
  if (isStringEmpty(value)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Host Name is required',
    };
  }
  return {
    validateStatus: 'success',
    errorMsg: '',
  };
};

export const validatePort = (
  value: string,
): { validateStatus: ValidateStatus; errorMsg: string | null } => {
  if (isStringEmpty(value)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Port is required',
    };
  }
  const port = +value;
  if (_.isNumber(port) && (port < 0 || port > 65000)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Only allow number from 0 to 65000',
    };
  }
  if (value.length < 1) {
    return {
      validateStatus: 'error',
      errorMsg: 'Minimum 1 character1',
    };
  }
  if (value.length > 5) {
    return {
      validateStatus: 'error',
      errorMsg: 'Maximum 5 characters',
    };
  }
  return {
    validateStatus: 'success',
    errorMsg: '',
  };
};

export const validateUsername = (
  value: string,
): { validateStatus: ValidateStatus; errorMsg: string | null } => {
  if (isStringEmpty(value)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Username is required',
    };
  }
  // if (value.length < 4) {
  //   return {
  //     validateStatus: 'error',
  //     errorMsg: 'Minimum 4 characters',
  //   };
  // }
  // if (value.length > 36) {
  //   return {
  //     validateStatus: 'error',
  //     errorMsg: 'Maximum 36 characters',
  //   };
  // }
  // if (!value.match(/^[a-zA-Z0-9_-]*$/)) {
  //   return {
  //     validateStatus: 'error',
  //     errorMsg: 'Invalid username',
  //   };
  // }
  return {
    validateStatus: 'success',
    errorMsg: '',
  };
};

export const validatePassword = (
  value: string,
): { validateStatus: ValidateStatus; errorMsg: string | null } => {
  if (isStringEmpty(value)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Password is required',
    };
  }
  // if (value.length < 8) {
  //   return {
  //     validateStatus: 'error',
  //     errorMsg: 'Minimum 8 characters',
  //   };
  // }
  // if (value.length > 36) {
  //   return {
  //     validateStatus: 'error',
  //     errorMsg: 'Maximum 36 characters',
  //   };
  // }
  return {
    validateStatus: 'success',
    errorMsg: '',
  };
};

export const validateDatabaseName = (
  value: string,
): { validateStatus: ValidateStatus; errorMsg: string | null } => {
  if (isStringEmpty(value)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Database Name is required',
    };
  }
  if (value.length < 4) {
    return {
      validateStatus: 'error',
      errorMsg: 'Minimum 4 characters',
    };
  }
  if (value.length > 36) {
    return {
      validateStatus: 'error',
      errorMsg: 'Maximum 36 characters',
    };
  }
  if (!value.match(/^[a-zA-Z0-9_]*$/)) {
    return {
      validateStatus: 'error',
      errorMsg: 'Invalid database name',
    };
  }
  return {
    validateStatus: 'success',
    errorMsg: '',
  };
};
