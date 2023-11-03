import { DrawerField } from '~/store/DrawerSlice';

export interface ERROR {
  key: string;
  message: string;
}

export interface LIST_OPTION {
  id: number;
  key?: string | number;
  name: string;
  field_id: number;
  ordered: number;
  isDelete?: boolean;
  plannedToAdd?: boolean;
  plannedToDelete?: boolean;
}

export interface LIST_OPTION_MODEL {
  id?: number;
  name: string;
  isDelete?: boolean;
}

export interface INDEX_FIELD {
  id?: string | number;
  key?: string | number;
  name: string;
  type: number;
  width: string;
  format: number;
  redflags: {
    required: number;
    uniqueKey: number;
    keyReference: number;
    autoIndex: number;
    dateStamp: number;
    dataReference: number;
  };
  userDefinedList: LIST_OPTION[];
  isDelete?: boolean;
}

export interface DRAWER {
  name: string;
  description: string;
  image_path: string;
  fields: INDEX_FIELD[];
}

export interface INDEX_FIELD_MODEL {
  id?: string | number;
  name: string;
  width: string;
  format_id: number;
  redflag: number[];
  lists: LIST_OPTION[];
  isDelete?: boolean;
}
export interface DRAWER_MODEL {
  name: string;
  description: string;
  image_path: string;
  database_id: number;
  fields: INDEX_FIELD_MODEL[];
  isDelete: boolean
}

export interface STATE {
  currentTab: number;
  drawer: DRAWER;
  originalDrawer: DRAWER;
  selectedIndexField: INDEX_FIELD;
  deletingIndexField: INDEX_FIELD;
  indexFieldsToRemove: INDEX_FIELD[];
  formatOptions: any[];
  error: ERROR;
  isEditingIndexField: boolean;
  isModalOpen: boolean;
}

export interface ACTION_TYPE {
  type: string;
  payload?: any;
}

export interface KeyDataRefImportType {
  id: string;
  rowIdx: number;
  cellValues: string[];
  fields: {
    id: number;
    name: string;
    isKeyRef?: boolean;
    isDataRef?: boolean;
    isAutoIndex?: boolean;
    fieldDetails: DrawerField;
  }[];
  valid: boolean;
  messages: string[];
}
