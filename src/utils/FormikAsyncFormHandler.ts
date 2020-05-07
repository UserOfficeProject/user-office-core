// submitForm async should work properly in Formik 2. Consider calling submitForm directly once upgraded
// https://github.com/jaredpalmer/formik/issues/1580
export default function submitFormAsync(
  submitForm: Function,
  validateForm: Function
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    submitForm()
      .then(validateForm)
      .then((errors: any) => {
        const isValid = Object.keys(errors).length === 0;
        resolve(isValid);
      })
      .catch((e: any) => {
        console.log('error: ', e);
        reject();
      });
  });
}
