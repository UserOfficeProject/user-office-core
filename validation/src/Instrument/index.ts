import * as Yup from 'yup';

export const createInstrumentValidationSchema = Yup.object().shape({
  name: Yup.string().required(),
  shortCode: Yup.string().required(),
  description: Yup.string().required(),
  managerUserId: Yup.number()
    .positive('Please specify beamline manager')
    .required('Please specify beamline manager'),
});

export const updateInstrumentValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  name: Yup.string().required(),
  shortCode: Yup.string().required(),
  description: Yup.string().required(),
  managerUserId: Yup.number()
    .positive('Please specify beamline manager')
    .required('Please specify beamline manager'),
});

export const deleteInstrumentValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
});

export const assignProposalsToInstrumentValidationSchema = Yup.object().shape({
  proposals: Yup.array(
    Yup.object().shape({ id: Yup.number(), callId: Yup.number() })
  )
    .min(1)
    .required(),
  instrumentId: Yup.number().required(),
});

export const removeProposalFromInstrumentValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required(),
  instrumentId: Yup.number().required(),
});

export const assignScientistsToInstrumentValidationSchema = Yup.object().shape({
  scientistIds: Yup.array(Yup.number()).min(1).required(),
  instrumentId: Yup.number().required(),
});

export const removeScientistFromInstrumentValidationSchema = Yup.object().shape(
  {
    scientistId: Yup.number().required(),
    instrumentId: Yup.number().required(),
  }
);

export const setAvailabilityTimeOnInstrumentValidationSchema =
  Yup.object().shape({
    callId: Yup.number().required(),
    instrumentId: Yup.number().required(),
    availabilityTime: Yup.number().min(0).required(),
  });

export const submitInstrumentValidationSchema = Yup.object().shape({
  callId: Yup.number().required(),
  instrumentId: Yup.number().required(),
  fapId: Yup.number().required(),
});
