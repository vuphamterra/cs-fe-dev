import _ from 'lodash';
import { INDEX_FIELD } from './interfaces';
import { MOCK_DATA } from './constants';
import { DrawerField } from '~/store/DrawerSlice';
import { FIELD_FLAG } from '~/constants';

export const trimAndReplace = (str: string, toBeReplaced: string, replaceWith: string) => {
  return str.trim().replace(toBeReplaced, replaceWith);
};

export const filterFormatByType = (types, formats) => {
  return types.reduce((accumulator, currentItem) => {
    accumulator[currentItem.id] = formats.filter((item) => item.type_id === currentItem.id);
    return accumulator;
  }, {});
};

export const getFormatOptions = (types: any[], formats: any[], typeId: number) => {
  const formatData = filterFormatByType(types, formats);
  if (!_.isEmpty(formatData)) {
    return [...formatData[typeId]];
  }
  return [];
};

export const getIndexFields = (drawData: any[], formats: any[]): INDEX_FIELD[] => {
  if (!_.isArray(drawData) || _.isEmpty(drawData)) {
    return [];
  }
  return drawData.map((item) => {
    const format = formats.find((f) => f.id === item.format_id);
    const getFlagValue = (flags: any[], key = '') => {
      return flags.find((f) => f.id === MOCK_DATA.REDFLAG_IDS[key]) ? 1 : 0;
    };
    const clonedList = _.cloneDeep(item.lists);
    if (_.isArray(clonedList) && !_.isEmpty(clonedList)) {
      clonedList.sort((a, b) => a.order_no - b.order_no);
    }
    const indexField: INDEX_FIELD = {
      id: item.id,
      key: item.id,
      name: item.name,
      type: !_.isEmpty(format) ? format.type_id : null,
      format: item.format_id,
      width: item.width,
      redflags: {
        required: getFlagValue(item.flags, 'required'),
        uniqueKey: getFlagValue(item.flags, 'uniqueKey'),
        keyReference: getFlagValue(item.flags, 'keyReference'),
        autoIndex: getFlagValue(item.flags, 'autoIndex'),
        dateStamp: getFlagValue(item.flags, 'dateStamp'),
        dataReference: getFlagValue(item.flags, 'dataReference'),
      },
      userDefinedList: clonedList || [],
    };
    return indexField;
  });
};

export const getTypeNameByTypeId = (types: { id: number; name: string }[], typeId: number) => {
  const type = types.find((item) => item.id === typeId);
  if (type) {
    return type.name;
  }
  return '';
};

export const hasKeyReference = (fields: DrawerField[] = []) => {
  const flags = fields.reduce((accumulator, currentField) => {
    accumulator.push(...currentField.flags);
    return accumulator;
  }, []);
  return flags.find((flag) => flag.id === FIELD_FLAG.KEY_REFERENCE) ?? null;
};

export const hasAutoIndex = (fields: DrawerField[] = []) => {
  const flags = fields.reduce((accumulator, currentField) => {
    accumulator.push(...currentField.flags);
    return accumulator;
  }, []);
  return flags.find((flag) => flag.id === FIELD_FLAG.AUTO_INDEX) ?? null;
};
