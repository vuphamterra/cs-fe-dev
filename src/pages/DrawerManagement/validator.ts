import _ from 'lodash';
import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';
import { KeyDataRefImportType } from './interfaces';
import { DATE_FORMAT, FIELD_FLAG, FIELD_TYPE_CODE, NUMBER_FORMAT, REGEX } from '~/constants';
import { getOriginalPhoneNumber, getOriginalSSN } from '~/utils';

dayjs.extend(CustomParseFormat);

export const validateKeyDataRefImport = (data: KeyDataRefImportType[]) => {
  // Key ref not empty
  data.forEach((item) => {
    item.fields.forEach((f, idx) => {
      if (f.isKeyRef && _.isEmpty(item.cellValues[idx])) {
        item.valid = false;
        item.messages.push('Key Reference cannot be empty');
      }
    });
  });
  // Key ref not unique
  const keyRefValues = [];
  data.forEach((item) => {
    if (!item.valid) {
      return;
    }
    item.fields.forEach((f, idx) => {
      if (!f.isKeyRef) {
        return;
      }
      const existingValue = keyRefValues.find((value) => value === item.cellValues[idx]);
      if (existingValue) {
        item.valid = false;
        item.messages.push('Key Reference must be unique');
      } else {
        keyRefValues.push(item.cellValues[idx]);
      }
    });
  });
  // Check unique for other data reference fields
  const { fields = [] } = data[0] || {};
  fields.forEach((f, idx) => {
    if (f.isKeyRef) {
      return;
    }
    const values = [];
    data.forEach((item) => {
      if (_.isEmpty(item.cellValues[idx])) {
        return;
      }
      const existingValue = values.find((value) => {
        if (f.fieldDetails.type.type_code === FIELD_TYPE_CODE.LIST) {
          return _.toLower(value) === _.toLower(item.cellValues[idx]); // no case sensitive
        }
        return value === item.cellValues[idx];
      });
      if (existingValue) {
        if (f.fieldDetails.flags.findIndex((flag) => flag.id === FIELD_FLAG.UNIQUE_KEY) >= 0) {
          item.valid = false;
          item.messages.push(`${f.name} must be unique`);
        }
      } else {
        values.push(item.cellValues[idx]);
      }
    });
  });
  // Other checks
  data.forEach((item) => {
    item.fields.forEach((f, idx) => {
      const {
        fieldDetails: { type, width, flags, lists, format_id: formatId },
      } = f;
      const value = item.cellValues[idx];
      // Check required
      if (_.isEmpty(value) && flags.findIndex((item) => item.id === FIELD_FLAG.REQUIRED) > -1) {
        item.valid = false;
        item.messages.push(`${f.name} is required`);
      }
      // Check number only
      if (
        type.type_code === FIELD_TYPE_CODE.NUMBER ||
        type.type_code === FIELD_TYPE_CODE.PHONE_NUMBER ||
        type.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY
      ) {
        if (!_.isEmpty(value)) {
          if (type.type_code === FIELD_TYPE_CODE.NUMBER) {
            if (!REGEX.FLOAT_NUMBER.test(value) && !REGEX.NUMBER_ONLY.test(value)) {
              item.valid = false;
              item.messages.push(`${f.name} accepts number only`);
            } else {
              if (formatId === NUMBER_FORMAT.NO_DECIMAL_PLACE && !REGEX.NUMBER_ONLY.test(value)) {
                item.valid = false;
                item.messages.push(`${f.name} must be an integer`);
              }
            }
          }
        }
      }
      // Check value length
      if (!_.isEmpty(value)) {
        // Text
        if (
          (type.type_code === FIELD_TYPE_CODE.TEXT || type.type_code === FIELD_TYPE_CODE.NUMBER) &&
          value.length > width
        ) {
          item.valid = false;
          item.messages.push(`${f.name} must has maximum ${width} characters`);
        }
        // Phone & Social Security
        if (
          type.type_code === FIELD_TYPE_CODE.PHONE_NUMBER ||
          type.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY
        ) {
          const format =
            type.type_code === FIELD_TYPE_CODE.PHONE_NUMBER
              ? getOriginalPhoneNumber(type.format)
              : getOriginalSSN(type.format);
          if (value.length !== format.length) {
            item.valid = false;
            item.messages.push(`${f.name} must has exact ${format.length} numbers`);
          }
        }
        // User defined list
        if (type.type_code === FIELD_TYPE_CODE.LIST) {
          if (value.length > 36) {
            item.valid = false;
            item.messages.push(`${f.name} must has maximum 36 characters`);
          }
          const option = lists.find((o) => _.toLower(o.name) === _.toLower(item.cellValues[idx]));
          if (!option) {
            item.valid = false;
            item.messages.push(`${f.name} has value which does not exist in the option list`);
          }
        }
        // Date
        if (type.type_code === FIELD_TYPE_CODE.DATE) {
          const isDateValid = dayjs(item.cellValues[idx], DATE_FORMAT[type.format], true).isValid();
          if (!isDateValid) {
            item.valid = false;
            item.messages.push(`${f.name} is invalid date or wrong format`);
          }
        }
      }
    });
  });
};
