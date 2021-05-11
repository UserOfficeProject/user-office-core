import { updateSEPValidationSchema } from '@esss-swap/duo-validation/lib/SEP';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field } from 'formik';
import React from 'react';

import { useCheckAccess } from 'components/common/Can';
import UOLoader from 'components/common/UOLoader';
import { Sep, UserRole } from 'generated/sdk';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);

  const sendSEPUpdate = async (values: Sep): Promise<void> => {
    await api('SEP updated successfully!').updateSEP(values);
    onSEPUpdate(values);
  };

  if (!sep) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={sep}
      onSubmit={async (values): Promise<void> => {
        await sendSEPUpdate(values);
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
            <Grid item sm={6} xs={12}>
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
                disabled={!hasAccessRights || isExecutingCall}
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
                disabled={!hasAccessRights || isExecutingCall}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
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
                disabled={!hasAccessRights || isExecutingCall}
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
                    disabled={!hasAccessRights || isExecutingCall}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
          {hasAccessRights && (
            <ButtonContainer>
              <Button
                disabled={isExecutingCall}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
                data-cy="submit"
              >
                {isExecutingCall && <UOLoader size={14} />}
                Update SEP
              </Button>
            </ButtonContainer>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default SEPGeneralInfo;
