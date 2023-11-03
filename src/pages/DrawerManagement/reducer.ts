import _ from 'lodash';
import { ACTION_TYPE, STATE } from './interfaces';
import { ACTION, FIELD_KEY } from './constants';
import { getFormatOptions, trimAndReplace } from './utils';
import { isStringEmpty } from '~/utils/validations';
import { FIELD_TYPE, MAX_LENGTH, REGEX } from '~/constants';

export const initialState: STATE = {
  currentTab: 1,
  drawer: {
    name: '',
    description: '',
    image_path: '',
    fields: [],
  },
  originalDrawer: {
    name: '',
    description: '',
    image_path: '',
    fields: [],
  },
  selectedIndexField: {
    name: '',
    type: 1,
    width: '0',
    format: 0,
    redflags: {
      required: 0,
      uniqueKey: 0,
      keyReference: 0,
      autoIndex: 0,
      dateStamp: 0,
      dataReference: 0,
    },
    userDefinedList: [],
  },
  deletingIndexField: null,
  indexFieldsToRemove: [],
  formatOptions: [],
  error: null,
  isEditingIndexField: false,
  isModalOpen: false,
};

export const reducer = (state: STATE, action: ACTION_TYPE) => {
  if (action.type === ACTION.CHANGE_TAB) {
    return {
      ...state,
      currentTab: action.payload,
    };
  }
  if (action.type === ACTION.CHANGE_DRAWER_NAME) {
    const drawerName = action.payload;
    let error = null;
    if (isStringEmpty(drawerName)) {
      error = {
        key: FIELD_KEY.DRAWER_NAME,
        message: 'Drawer name cannot be empty. Please enter the drawer name',
      };
    } else if (drawerName.length < 4) {
      error = {
        key: FIELD_KEY.DRAWER_NAME,
        message: 'Minimum 4 characters',
      };
    } else if (drawerName.length > 64) {
      error = {
        key: FIELD_KEY.DRAWER_NAME,
        message: 'Maximum 64 characters',
      };
    } else if (!drawerName.match(REGEX.DRAWER_NAME)) {
      error = {
        key: FIELD_KEY.DRAWER_NAME,
        message: 'Invalid drawer name',
      };
    }
    return {
      ...state,
      drawer: {
        ...state.drawer,
        name: action.payload,
      },
      error,
    };
  }
  if (action.type === ACTION.CHANGE_FILE_LOCATION) {
    const drawer = _.cloneDeep(state.drawer);
    const location = action.payload;
    let error = null;
    if (isStringEmpty(location)) {
      error = {
        key: FIELD_KEY.FILE_PATH,
        message: 'File location cannot be empty',
      };
    }
    drawer.image_path = action.payload;
    return {
      ...state,
      drawer,
      error,
    };
  }
  if (action.type === ACTION.CHANGE_DRAWER_DESC) {
    const drawer = _.cloneDeep(state.drawer);
    drawer.description = action.payload;
    return {
      ...state,
      drawer,
    };
  }
  if (action.type === ACTION.CHANGE_FIELD_NAME) {
    let error = null;
    const name = action.payload;
    if (isStringEmpty(name)) {
      error = {
        key: FIELD_KEY.FIELD_NAME,
        message: 'Field name cannot be empty. Please enter Field Name',
      };
    } else if (name.length < 1) {
      error = {
        key: FIELD_KEY.FIELD_NAME,
        message: 'Minimum 1 character',
      };
    } else if (name.length > 36) {
      error = {
        key: FIELD_KEY.FIELD_NAME,
        message: 'Maximum 36 characters',
      };
    }
    return {
      ...state,
      selectedIndexField: {
        ...state.selectedIndexField,
        name: action.payload,
      },
      error,
    };
  }
  if (action.type === ACTION.CHANGE_FIELD_TYPE) {
    // Update Date Stamp if the Field Type is changed from Date to others
    const indexField = _.cloneDeep(state.selectedIndexField);
    if (action.payload !== FIELD_TYPE.DATE && indexField.redflags.dateStamp === 1) {
      indexField.redflags.dateStamp = 0;
    }
    // Reset auto index
    if (action.payload === FIELD_TYPE.LIST && indexField.redflags.autoIndex === 1) {
      indexField.redflags.autoIndex = 0;
    }

    return {
      ...state,
      selectedIndexField: {
        ...indexField,
        type: action.payload,
        width: '0',
        userDefinedList: [],
      },
    };
  }
  if (action.type === ACTION.CHANGE_FORMAT_OPTIONS) {
    const selectedIndexField = _.cloneDeep(state.selectedIndexField);
    const formatOptions = action.payload || [];
    if (formatOptions.length) {
      const format = formatOptions.find((item) => item.id === selectedIndexField.format);
      if (!state.isEditingIndexField || !format) {
        selectedIndexField.format = formatOptions[0].id;
      }
    }
    return {
      ...state,
      selectedIndexField,
      formatOptions,
    };
  }
  if (action.type === ACTION.CHANGE_WIDTH) {
    const { type } = state.selectedIndexField;
    let error = null;
    const widthValue = +action.payload;
    if (!widthValue || widthValue === 0) {
      error = {
        key: FIELD_KEY.FIELD_WIDTH,
        message: 'Width must larger than 0',
      };
    } else if ((type === 1 || type === 5) && widthValue > MAX_LENGTH[type]) {
      error = {
        key: FIELD_KEY.FIELD_WIDTH,
        message: `Width must be equal or less than ${MAX_LENGTH[type]}`,
      };
    } else if (type === 2 && widthValue > MAX_LENGTH[type]) {
      error = {
        key: FIELD_KEY.FIELD_WIDTH,
        message: `Width must be equal or less than ${MAX_LENGTH[type]}`,
      };
    }
    return {
      ...state,
      selectedIndexField: {
        ...state.selectedIndexField,
        width: action.payload ?? initialState.selectedIndexField.width,
      },
      error,
    };
  }
  if (action.type === ACTION.CHANGE_FORMAT) {
    const selectedIndexField = _.cloneDeep(state.selectedIndexField);
    selectedIndexField.format = action.payload;
    return {
      ...state,
      selectedIndexField,
    };
  }
  if (action.type === ACTION.CHANGE_REDFLAG) {
    const { name, value } = action.payload;
    const indexField = _.cloneDeep(state.selectedIndexField);
    indexField.redflags[name] = value ? 1 : 0;
    return {
      ...state,
      selectedIndexField: { ...indexField },
    };
  }
  if (action.type === ACTION.INSERT_INDEX_FIELD) {
    const updatedDrawer = _.cloneDeep(state.drawer);
    const existedField = updatedDrawer.fields.find(
      (field) => field.name === state.selectedIndexField.name,
    );
    if (!existedField) {
      const indexField = _.cloneDeep(state.selectedIndexField);
      if (!indexField.format && action.payload.format) {
        indexField.format = action.payload.format;
      }
      updatedDrawer.fields.push(indexField);
    }
    return {
      ...state,
      drawer: { ...updatedDrawer },
      selectedIndexField: _.cloneDeep(initialState.selectedIndexField),
      formatOptions: getFormatOptions(
        action.payload.types,
        action.payload.formats,
        initialState.selectedIndexField.type,
      ),
    };
  }
  if (action.type === ACTION.CHANGE_ERROR) {
    return {
      ...state,
      error: action.payload,
    };
  }
  if (action.type === ACTION.EDIT_INDEX_FIELD) {
    const { isEditingIndexField, indexFieldToBeEdited } = action.payload;
    let selectedIndexField = _.cloneDeep(state.selectedIndexField);
    if (isEditingIndexField) {
      selectedIndexField.id = indexFieldToBeEdited.id;
      selectedIndexField.key = indexFieldToBeEdited.key;
      selectedIndexField.name = indexFieldToBeEdited.name;
      selectedIndexField.type = indexFieldToBeEdited.type;
      selectedIndexField.format = indexFieldToBeEdited.format;
      selectedIndexField.width = indexFieldToBeEdited.width;
      selectedIndexField.redflags = _.cloneDeep(indexFieldToBeEdited.redflags);
      selectedIndexField.userDefinedList = indexFieldToBeEdited.userDefinedList;
    } else {
      selectedIndexField = _.cloneDeep(initialState.selectedIndexField);
    }
    return {
      ...state,
      selectedIndexField,
      isEditingIndexField,
    };
  }
  if (action.type === ACTION.UPDATE_INDEX_FIELD) {
    const updatedIndexField = action.payload.selectedIndexField;
    const fields = _.cloneDeep(state.drawer.fields);
    const indexField = fields.findIndex((field) => {
      if (field.key) {
        return field.key === updatedIndexField.key;
      }
      return trimAndReplace(field.name, ' ', '_') === updatedIndexField.key;
    });
    if (indexField >= 0) {
      fields[indexField] = _.cloneDeep(updatedIndexField);
    }
    const drawer = _.cloneDeep(state.drawer);
    drawer.fields = fields;
    return {
      ...state,
      drawer,
      selectedIndexField: _.cloneDeep(initialState.selectedIndexField),
      formatOptions: getFormatOptions(
        action.payload.types,
        action.payload.formats,
        initialState.selectedIndexField.type,
      ),
      isEditingIndexField: false,
    };
  }
  if (action.type === ACTION.CHANGE_MODAL_STATUS) {
    const { status, deletingIndexField } = action.payload;
    return {
      ...state,
      isModalOpen: status,
      deletingIndexField: status ? deletingIndexField : null,
    };
  }
  if (action.type === ACTION.DELETE_INDEX_FIELD) {
    const updatedDrawer = _.cloneDeep(state.drawer);
    if (state.deletingIndexField.id) {
      const exitedField = state.indexFieldsToRemove.find(
        (field) => field.id === state.deletingIndexField.id,
      );
      if (!exitedField) {
        state.indexFieldsToRemove.push({ ...state.deletingIndexField });
      }
    }
    const updatedFields = updatedDrawer.fields.filter(
      (field) => field.name !== state.deletingIndexField.name,
    );
    const selectedIndexFieldCloned =
      state.selectedIndexField.key === state.deletingIndexField.key
        ? _.cloneDeep(initialState.selectedIndexField)
        : _.cloneDeep(state.selectedIndexField);
    if (state.deletingIndexField.redflags.keyReference === 1) {
      updatedFields.forEach((item) => {
        if (item.redflags.dataReference === 1) {
          item.redflags.dataReference = 0;
        }
        if (
          item.key === selectedIndexFieldCloned.key &&
          selectedIndexFieldCloned.redflags.dataReference === 1
        ) {
          selectedIndexFieldCloned.redflags.dataReference = 0;
        }
      });
    }
    updatedDrawer.fields = updatedFields;

    return {
      ...state,
      drawer: updatedDrawer,
      isModalOpen: false,
      selectedIndexField: _.cloneDeep(selectedIndexFieldCloned),
      isEditingIndexField:
        state.selectedIndexField.key === state.deletingIndexField.key
          ? false
          : _.cloneDeep(state.isEditingIndexField),
    };
  }
  if (action.type === ACTION.CHANGE_DRAWER) {
    return {
      ...state,
      drawer: _.cloneDeep(action.payload),
      originalDrawer: _.cloneDeep(action.payload),
    };
  }
  if (action.type === ACTION.CHANGE_INDEX_FIELDS_TO_REMOVE) {
    return {
      ...state,
      indexFieldsToRemove: _.cloneDeep(action.payload),
    };
  }
  if (action.type === ACTION.CHANGE_LIST_OPTIONS) {
    const selectedIndexField = _.cloneDeep(state.selectedIndexField);
    selectedIndexField.userDefinedList = action.payload || [];
    return {
      ...state,
      selectedIndexField,
    };
  }
  return { ...initialState };
};
