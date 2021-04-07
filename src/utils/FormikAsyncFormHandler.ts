// submitForm async should work properly in Formik 2. Consider calling submitForm directly once upgraded

import { FormikErrors } from 'formik';

import { FunctionType } from './utilTypes';

// https://github.com/jaredpalmer/formik/issues/1580
export default function submitFormAsync(
  submitForm: FunctionType<Promise<void>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateForm: FunctionType<Promise<FormikErrors<any>>>
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    submitForm()
      .then(validateForm)
      .then((errors) => {
        const isValid = Object.keys(errors).length === 0;
        resolve(isValid);
      })
      .catch((e) => {
        console.log('error: ', e);
        reject();
      });
  });
}
