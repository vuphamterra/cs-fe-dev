export const ACTION = {
  CHANGE_TAB: 'CHANGE_TAB',
  CHANGE_DRAWER_NAME: 'CHANGE_DRAWER_NAME',
  CHANGE_FILE_LOCATION: 'CHANGE_FILE_LOCATION',
  CHANGE_DRAWER_DESC: 'CHANGE_DRAWER_DESC',
  CHANGE_FIELD_NAME: 'CHANGE_FIELD_NAME',
  CHANGE_FIELD_TYPE: 'CHANGE_FIELD_TYPE',
  CHANGE_WIDTH: 'CHANGE_WIDTH',
  CHANGE_FORMAT: 'CHANGE_FORMAT',
  CHANGE_REDFLAG: 'CHANGE_REDFLAG',
  INSERT_INDEX_FIELD: 'INSERT_INDEX_FIELD',
  CHANGE_ERROR: 'CHANGE_ERROR',
  EDIT_INDEX_FIELD: 'EDIT_INDEX_FIELD',
  UPDATE_INDEX_FIELD: 'UPDATE_INDEX_FIELD',
  CHANGE_MODAL_STATUS: 'CHANGE_MODAL_STATUS',
  DELETE_INDEX_FIELD: 'DELETE_INDEX_FIELD',
  RESET_STATE: 'RESET_STATE',
  CHANGE_FORMAT_OPTIONS: 'CHANGE_FORMAT_OPTIONS',
  CHANGE_DRAWER: 'CHANGE_DRAWER',
  CHANGE_INDEX_FIELDS_TO_REMOVE: 'CHANGE_INDEX_FIELDS_TO_REMOVE',
  CHANGE_LIST_OPTIONS: 'CHANGE_LIST_OPTIONS',
};

export const FIELD_KEY = {
  DRAWER_NAME: 'DRAWER_NAME',
  FILE_PATH: 'FILE_PATH',
  FIELD_NAME: 'FIELD_NAME',
  FIELD_WIDTH: 'FIELD_WIDTH',
};

export const MOCK_DATA = {
  FIELD_TYPE: [
    { key: 'text', name: 'Text' },
    { key: 'number', name: 'Number' },
    { key: 'date', name: 'Date' },
    { key: 'social_security', name: 'Social Security' },
    { key: 'defined_list', name: 'User-Defined List' },
  ],
  FORMAT: {
    DATE: [
      { key: 'dd/mm/yy', name: 'dd/mm/yy' },
      { key: 'dd/mm/yyyy', name: 'dd/mm/yyyy' },
      { key: 'dd-mm-yy', name: 'dd-mm-yy' },
      { key: 'dd-mm-yyyy', name: 'dd-mm-yyyy' },
    ],
    SOCIAL_SECURITY: [
      { key: '#########', name: '#########' },
      { key: '###-##-####', name: '###-##-####' },
    ],
    NUMBER: [
      { key: '####', name: '####' },
      { key: '####.##', name: '####.##' },
      { key: '#,###', name: '#,###' },
      { key: '#,###.##', name: '#,###.##' },
    ],
  },
  REDFLAG_IDS: {
    required: 1,
    uniqueKey: 2,
    keyReference: 3,
    autoIndex: 4,
    dateStamp: 5,
    dataReference: 6,
  },
};

export const CREATION_STEPS = [
  {
    id: 1,
    text: 'Add Drawer Info',
  },
  {
    id: 2,
    text: 'Choose Drawer Location',
  },
  {
    id: 3,
    text: 'Create Index Field',
  },
];
