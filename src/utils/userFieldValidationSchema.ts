import * as Yup from 'yup';

import { useDataApi } from 'hooks/common/useDataApi';

export function useNaturalKeySchema(initialValue: string) {
  const api = useDataApi();

  return Yup.string()
    .matches(/^[A-Za-z\d_]*$/, 'You can use letters, numbers and underscore')
    .max(128)
    .required('This is a required field')
    .test('checkDuplNaturalKey', 'This key is already used', function (value) {
      if (!value) {
        return this.createError({ message: 'Please specify key' });
      }
      if (value === initialValue) {
        return true;
      }

      return new Promise((resolve, reject) => {
        api()
          .getIsNaturalKeyPresent({ naturalKey: value })
          .then((responseWrap) => {
            const response = responseWrap.isNaturalKeyPresent;
            if (response === null) {
              reject();
            } else {
              resolve(!response);
            }
          });
      });
    });
}

export const naturalKeySchema = Yup.string();
