import * as Yup from 'yup';

export const sampleDeclarationValidationSchema = (field: any) => {
  const config = field.config;
  let schema = Yup.array().of<Yup.AnyObjectSchema>(Yup.object());

  if (config.minEntries) {
    schema = schema.min(
      config.minEntries,
      `Please add at least ${config.minEntries} sample(s)`
    );
  }
  if (config.maxEntries) {
    schema = schema.max(
      config.maxEntries,
      `Please add at most ${config.maxEntries} sample(s)`
    );
  }

  schema = schema.test(
    'allSamplesCompleted',
    'All samples must be completed',
    (value) =>
      value?.every((sample) => sample?.questionary.isCompleted) ?? false
  );

  return schema;
};
