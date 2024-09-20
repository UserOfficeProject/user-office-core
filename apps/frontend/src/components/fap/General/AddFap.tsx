import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createFapValidationSchema } from '@user-office-software/duo-validation/lib/fap';
import { Field, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { Fap } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type AddFapProps = {
  close: (fapAdded: Fap | null) => void;
};

const AddFap = ({ close }: AddFapProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{
        code: '',
        description: '',
        numberRatingsRequired: 2,
        active: true,
      }}
      onSubmit={async (values): Promise<void> => {
        try {
          const { createFap } = await api({
            toastSuccessMessage: `${t('Fap')} created successfully!`,
          }).createFap(values);

          close(createFap);
        } catch (error) {
          close(null);
        }
      }}
      validationSchema={createFapValidationSchema}
    >
      {(): JSX.Element => (
        <Form>
          <Typography variant="h6" component="h1">
            Create new {t('Fap')}
          </Typography>

          <Field
            name="code"
            id="code"
            label="Code"
            type="text"
            component={TextField}
            fullWidth
            data-cy="code"
            required
            disabled={isExecutingCall}
          />
          <Field
            id="description"
            name="description"
            label="Description"
            type="text"
            component={TextField}
            fullWidth
            multiline
            maxRows="16"
            minRows="3"
            data-cy="description"
            required
            disabled={isExecutingCall}
          />

          <Field
            id="numberRatingsRequired"
            name="numberRatingsRequired"
            label="Number of ratings required"
            type="number"
            component={TextField}
            fullWidth
            data-cy="numberRatingsRequired"
            disabled={isExecutingCall}
          />

          <Field
            id="active"
            name="active"
            component={CheckboxWithLabel}
            type="checkbox"
            Label={{
              label: 'Active',
            }}
            data-cy="fapActive"
          />

          <Button
            type="submit"
            fullWidth
            sx={(theme) => ({ margin: theme.spacing(3, 0, 2) })}
            data-cy="submit"
            disabled={isExecutingCall}
          >
            {isExecutingCall && <UOLoader size={14} />}
            Create
          </Button>
        </Form>
      )}
    </Formik>
  );
};

AddFap.propTypes = {
  close: PropTypes.func.isRequired,
};

export default AddFap;
