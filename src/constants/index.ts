export const UPLOAD_TYPE = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  PDF: 'application/pdf',
};
export const DASHBOARD = {
  ADMIN: 'admin',
  CLIENT: 'client',
};
export const REDUX_PERSIST_KEY = 'root';
export const LOCAL_STORAGE_KEY = `persist:${REDUX_PERSIST_KEY}`;
// Based on type id in database
export const FIELD_TYPE = {
  TEXT: 1,
  NUMBER: 2,
  DATE: 3,
  SOCIAL_SECURITY: 4,
  LIST: 5,
  PHONE_NUMBER: 6,
};
export const FIELD_TYPE_CODE = {
  TEXT: 'TXT',
  NUMBER: 'NUM',
  DATE: 'DTE',
  SOCIAL_SECURITY: 'SS',
  LIST: 'LST',
  PHONE_NUMBER: 'PN',
};

// Based on flag id in database
export const FIELD_FLAG = {
  REQUIRED: 1,
  UNIQUE_KEY: 2,
  KEY_REFERENCE: 3,
  AUTO_INDEX: 4,
  DATE_STAMP: 5,
  DATA_REFERENCE: 6,
};
// Based on format id in database
export const DATE_FORMAT = {
  3: 'MM/DD/YYYY',
  4: 'MM/DD/YY',
  5: 'MM-DD-YY',
  6: 'MM-DD-YYYY',
  12: 'YYYYMMDD',
  13: 'DD/MM/YY',
  14: 'DD/MM/YYYY',
  15: 'DD-MM-YY',
  16: 'DD-MM-YYYY',
  'mm/dd/yyyy': 'MM/DD/YYYY',
  'mm/dd/yy': 'MM/DD/YY',
  'mm-dd-yy': 'MM-DD-YY',
  'mm-dd-yyyy': 'MM-DD-YYYY',
  yyyymmdd: 'YYYYMMDD',
  'dd/mm/yy': 'DD/MM/YY',
  'dd/mm/yyyy': 'DD/MM/YYYY',
  'dd-mm-yy': 'DD-MM-YY',
  'dd-mm-yyyy': 'DD-MM-YYYY',
};

export const NUMBER_FORMAT = {
  NO_DECIMAL_PLACE: 2,
  ONE_DECIMAL_PLACE: 9,
  TWO_DECIMAL_PLACE: 10,
  THREE_DECIMAL_PLACE: 11,
};

export const DECIMAL_NUMBER = {
  [NUMBER_FORMAT.NO_DECIMAL_PLACE]: 0,
  [NUMBER_FORMAT.ONE_DECIMAL_PLACE]: 1,
  [NUMBER_FORMAT.TWO_DECIMAL_PLACE]: 2,
  [NUMBER_FORMAT.THREE_DECIMAL_PLACE]: 3,
};
// Drawer permissions
export const DRAWER_PERMISSION = {
  DISPLAY: 'DISPLAY',
  CREATE_FOLDER: 'CRE_FLD',
  DELETE_FOLDER: 'DEL_FLD',
  MODIFY_INDEX_FIELD: 'MOD_INDX_FL',
  DELETE_PAGE: 'DEL_PG',
  ADD_NOTE: 'ADD_NT',
  EDIT_NOTE: 'EDT_NT',
  EXPORT: 'EXP',
  CONFIGURATION: 'CONF',
  MIGRATE_FOLDER: 'MGRT_FLD',
  PRINT: 'PRT',
  DELETE_FILE: 'DEL_FLE',
};

export const SORT = {
  ASC: 'asc',
  DESC: 'desc',
};

export const PHONE_NUMBER = {
  FORMAT_ID: [18, 19, 20],
  FORMAT_PATTERN: {
    18: /^(\d{3})(\d{3})(\d{4})$/,
    19: /^(\d{3})(\d{3})(\d{4})$/,
    20: /^(\d{2})(\d{2})(\d{3})(\d{4})$/,
  },
};

export const MAX_LENGTH = {
  [FIELD_TYPE.TEXT]: 255,
  [FIELD_TYPE.NUMBER]: 12,
  [`${FIELD_TYPE.PHONE_NUMBER}-${PHONE_NUMBER.FORMAT_ID[0]}`]: 10,
  [`${FIELD_TYPE.PHONE_NUMBER}-${PHONE_NUMBER.FORMAT_ID[1]}`]: 10,
  [`${FIELD_TYPE.PHONE_NUMBER}-${PHONE_NUMBER.FORMAT_ID[2]}`]: 11,
};

export const INITIAL_SETTING_STEP = {
  FIRST: 'app-settings',
  SECOND: 'add-new-db',
};

export const REGEX = {
  DRAWER_NAME: /^[a-zA-Z0-9_-]*$/,
  NUMBER_ONLY: /^\d+$/,
  FLOAT_NUMBER: /^[\d]+\.[\d]+$/,
  PHONE_NUMBER_SPECIAL_CHARACTER: /[-+()\s]/g,
};
