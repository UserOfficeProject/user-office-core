import * as Yup from 'yup';

export const createTechniqueValidationSchema = Yup.object().shape({
  name: Yup.string().required(),
  shortCode: Yup.string().required(),
  description: Yup.string().required(),
});

export const updateTechniqueValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  name: Yup.string().required(),
  shortCode: Yup.string().required(),
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
    instrumentId: Yup.number().required(),
    techniqueId: Yup.number().required(),
  });
