import * as yup from 'yup';

const SEPValidationSchema = yup.object().shape({
  code: yup.string().required('Code can not be blank'),
  description: yup.string().required('Description can not be blank'),
  numberRatingsRequired: yup
    .number()
    .min(2, 'Ratings required can not be lower than 2'),
});

export default SEPValidationSchema;
