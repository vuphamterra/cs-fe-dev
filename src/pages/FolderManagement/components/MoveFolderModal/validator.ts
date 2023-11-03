import _ from 'lodash';
import { FIELD_FLAG, FIELD_TYPE_CODE } from '~/constants';
import { FIELD_MAPPING } from '.';
import { getOriginalPhoneNumber } from '~/utils';

const FIELD_TYPE_POSIBILITY = {
  Text: [-1, 1, 2, 3, 4, 5, 6],
  Number: [-1, 2, 6],
  Date: [-1, 3],
  'Social Security': [-1, 2, 4],
  List: [-1, 1, 2, 3, 4, 5, 6],
  'Phone Number': [-1, 2, 6],
};

const FIELD_WIDTH_POSIBILITY = {
  EQUAL_OR_GREATER: ['Text', 'Number', 'Date'],
  EQUAL: ['Date', 'Social Security', 'Phone Number'],
};

export const validate = (data: FIELD_MAPPING[]) => {
  if (!data.length) {
    return true;
  }

  data.forEach((item) => {
    item.errorMessage = null;
    if (!isSuitableToMap(item.selectedSourceField, item.destinationField)) {
      item.errorMessage = 'Type of Source Field and Destination Field is not suitable to map';
      return;
    }
    if (item.selectedSourceField.fieldId === -1 && isFieldRequiredToMap(item.destinationField)) {
      item.errorMessage = 'Destination Field is required';
      return;
    }
    if (
      item.destinationField.type.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY &&
      item.selectedSourceField.typeName !== 'Social Security' &&
      item.selectedSourceField.width !== 9 &&
      isFieldRequiredToMap(item.destinationField)
    ) {
      item.errorMessage = 'Width of Source Field must be 9';
      return;
    }
    if (item.destinationField.type.type_code === FIELD_TYPE_CODE.PHONE_NUMBER) {
      if (
        item.selectedSourceField.typeName !== 'Phone Number' &&
        item.selectedSourceField.fieldId !== -1
      ) {
        const phoneWidth = getOriginalPhoneNumber(item.destinationField.type.format).length;
        if (item.selectedSourceField.width !== phoneWidth) {
          item.errorMessage = `Width of Source Field must be ${phoneWidth}`;
          return;
        }
      }
      if (
        item.selectedSourceField.typeName === 'Phone Number' &&
        item.selectedSourceField.formatId !== item.destinationField.format_id
      ) {
        item.errorMessage = 'Format of Source Field must be the same of Destination Field';
        return;
      }
    }
    if (
      FIELD_WIDTH_POSIBILITY.EQUAL_OR_GREATER.includes(item.destinationField.type.type_name) &&
      item.destinationField.width < item.selectedSourceField.width
    ) {
      item.errorMessage =
        'Width of Destination Field must be equal or greater than width of Source Field';
      return;
    }
    if (
      item.selectedSourceField.typeName === 'Number' &&
      item.destinationField.type.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY &&
      item.selectedSourceField.width !== 9
    ) {
      item.errorMessage = 'Width of Source Field must be 9';
      return;
    }
    if (item.destinationField.type.type_code === FIELD_TYPE_CODE.NUMBER) {
      if (
        item.selectedSourceField.typeName === 'Number' &&
        item.selectedSourceField.formatId !== item.destinationField.format_id
      ) {
        item.errorMessage = 'Format of Source Field must be the same of Destination Field';
      }
    }
  });

  const isValid = data.every((item) => !item.errorMessage);
  return isValid;
};

const isSuitableToMap = (sourceField, destinationField) => {
  const suitableTypeIds = FIELD_TYPE_POSIBILITY[destinationField.type.type_name];
  return (
    _.isArray(suitableTypeIds) &&
    suitableTypeIds.length &&
    suitableTypeIds.includes(sourceField.typeId)
  );
};

const isFieldRequiredToMap = (destinationField) => {
  return (
    destinationField &&
    _.isArray(destinationField.flags) &&
    destinationField.flags.findIndex((item) => item.id === FIELD_FLAG.REQUIRED) > -1
  );
};
