import _ from 'lodash';

export const isStringEmpty = (value: string) => {
  return _.isEmpty(_.trim(value));
};
