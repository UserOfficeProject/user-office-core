import * as Yup from 'yup';

export const createTechniqueValidationSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, 'Name of the technique should be no longer than 100 characters')
    .required('Name of the technique is required'),
  shortCode: Yup.string()
    .max(
      20,
      'Short code of the technique should be no longer than 20 characters'
    )
    .required('Short code of the technique is required'),
  description: Yup.string().required(),
});

export const updateTechniqueValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  name: Yup.string()
    .max(100, 'Name of the technique should be no longer than 100 characters')
    .required('Name of the technique is required'),
  shortCode: Yup.string()
    .max(
      20,
      'Short code of the technique should be no longer than 20 characters'
    )
    .required('Short code of the technique is required'),
  description: Yup.string().required(),
});

export const deleteTechniqueValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
});

export const assignInstrumentsToTechniqueValidationSchema = Yup.object().shape({
  instrumentIds: Yup.array(Yup.number()).min(1).required(),
  techniqueId: Yup.number().required(),
});

export const removeInstrumentsFromTechniqueValidationSchema =
  Yup.object().shape({
    instrumentIds: Yup.array(Yup.number()).min(1).required(),
    techniqueId: Yup.number().required(),
  });

export const assignScientistsToTechniqueValidationSchema = Yup.object().shape({
  scientistIds: Yup.array(Yup.number()).min(1).required(),
  techniqueId: Yup.number().required(),
});

export const removeScientistFromTechniqueValidationSchema = Yup.object().shape({
  scientistId: Yup.number().required(),
  techniqueId: Yup.number().required(),
});
