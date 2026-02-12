import * as Yup from 'yup';

const checkValidJson = (value: string | null | undefined) => {
  if (!value) {
    return false;
  }

  try {
    const parsedObject = JSON.parse(value);
    if (Object.keys(parsedObject).length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const setPageTextValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  text: Yup.string().notRequired(),
});

export const createApiAccessTokenValidationSchema = (
  isBackendValidation: boolean
) =>
  Yup.object().shape({
    name: Yup.string().required(),
    accessPermissions: isBackendValidation
      ? Yup.string()
          .required('You must select at least one query or mutation for access')
          .test('Is valid object', 'Requires valid JSON', checkValidJson)
      : Yup.array()
          .of(Yup.string())
          .required(
            'You must select at least one query or mutation for access'
          ),
  });

export const updateApiAccessTokenValidationSchema = (
  isBackendValidation: boolean
) =>
  Yup.object().shape({
    accessTokenId: isBackendValidation
      ? Yup.string().required()
      : Yup.string().notRequired(),
    name: Yup.string().required(),
    accessPermissions: isBackendValidation
      ? Yup.string()
          .required('You must select at least one query or mutation for access')
          .test('Is valid object', 'Requires valid JSON', checkValidJson)
      : Yup.array()
          .of(Yup.string())
          .required(
            'You must select at least one query or mutation for access'
          ),
  });
