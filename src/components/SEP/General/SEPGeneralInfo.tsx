import { updateSEPValidationSchema } from '@esss-swap/duo-validation';
import {
  makeStyles,
  Typography,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import UOLoader from 'components/common/UOLoader';
import { Sep, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ButtonContainer } from 'styles/StyledComponents';

type SEPPageProps = {
  /** SEP data to be shown */
  data: Sep;
  /** Method executed when SEP is updated successfully */
  onSEPUpdate: (sep: Sep) => void;
};

const useStyles = makeStyles({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const SEPGeneralInfo: React.FC<SEPPageProps> = ({ data, onSEPUpdate }) => {
  const sep = { ...data };
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const sendSEPUpdate = async (values: Sep): Promise<void> => {
    const result = await api().updateSEP(values);
    onSEPUpdate(values);
    enqueueSnackbar('Updated Information', {
      variant: result.updateSEP.error ? 'error' : 'success',
    });
    setSubmitting(false);
  };

  if (!sep) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={sep}
      onSubmit={async (values, actions): Promise<void> => {
        setSubmitting(true);
        await sendSEPUpdate(values);
        actions.setSubmitting(false);
      }}
      validationSchema={updateSEPValidationSchema}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        setFieldValue,
      }): JSX.Element => (
        <Form>
          <Typography variant="h6" gutterBottom>
            Scientific evaluation panel
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Field
                name="code"
                id="code"
                label="Code"
                type="text"
                value={values.code}
                onChange={handleChange}
                component={TextField}
                margin="normal"
                fullWidth
                data-cy="code"
                error={touched.code && errors.code !== undefined}
                helperText={touched.code && errors.code && errors.code}
                disabled={!hasAccessRights || submitting}
              />
              <Field
                id="numberRatingsRequired"
                name="numberRatingsRequired"
                label="Number of ratings required"
                type="number"
                component={TextField}
                margin="normal"
                fullWidth
                onChange={handleChange}
                value={values.numberRatingsRequired}
                data-cy="numberRatingsRequired"
                error={
                  touched.numberRatingsRequired &&
                  errors.numberRatingsRequired !== undefined
                }
                helperText={
                  touched.numberRatingsRequired &&
                  errors.numberRatingsRequired &&
                  errors.numberRatingsRequired
                }
                disabled={!hasAccessRights || submitting}
              />
            </Grid>
            <Grid item xs={6}>
              <Field
                id="description"
                name="description"
                label="Description"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
                multiline
                rowsMax="16"
                rows="3"
                onChange={handleChange}
                value={values.description}
                data-cy="description"
                error={touched.description && errors.description !== undefined}
                helperText={
                  touched.description &&
                  errors.description &&
                  errors.description
                }
                disabled={!hasAccessRights || submitting}
              />
              <FormControlLabel
                control={
                  <Field
                    id="active"
                    name="active"
                    type="checkbox"
                    component={Checkbox}
                    checked={values.active}
                    color="primary"
                    onChange={(): void =>
                      setFieldValue('active', !values.active)
                    }
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                    disabled={!hasAccessRights || submitting}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
          {hasAccessRights && (
            <ButtonContainer>
              <Button
                disabled={submitting}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
                data-cy="submit"
              >
                {submitting && <UOLoader size={14} />}
                Update SEP
              </Button>
            </ButtonContainer>
          )}
        </Form>
      )}
    </Formik>
  );
};

SEPGeneralInfo.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    numberRatingsRequired: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
  }).isRequired,
  onSEPUpdate: PropTypes.func.isRequired,
};

export default SEPGeneralInfo;
