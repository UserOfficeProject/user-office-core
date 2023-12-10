import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { updateFapValidationSchema } from '@user-office-software/duo-validation/lib/fap';
import { Formik, Form, Field } from 'formik';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import UOLoader from 'components/common/UOLoader';
import FapGradeGuide from 'components/fap/FapGradeGuide';
import { Fap, UserRole } from 'generated/sdk';
import { StyledButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type FapPageProps = {
  /** Fap data to be shown */
  data: Fap;
  /** Method executed when Fap is updated successfully */
  onFapUpdate: (fap: Fap) => void;
};

const useStyles = makeStyles({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const FapGeneralInfo = ({ data, onFapUpdate }: FapPageProps) => {
  const fap = { ...data };
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);

  const [customGradeGuideChecked, setCustomGradeGuideChecked] = useState(
    fap.customGradeGuide
  );
  const handleCustomGradeGuideChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomGradeGuideChecked(event.target.checked);
  };

  const sendFapUpdate = async (values: Fap): Promise<void> => {
    await api({
      toastSuccessMessage: 'Fap updated successfully!',
    }).updateFap(values);
    onFapUpdate(values);
  };

  if (!fap) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={fap}
      onSubmit={async (values): Promise<void> => {
        await sendFapUpdate(values);
      }}
      validationSchema={updateFapValidationSchema}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        setFieldValue,
        setValues,
      }): JSX.Element => (
        <Form>
          <Typography variant="h6" component="h2" gutterBottom>
            {`${fap.code} Facility access panel`}
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
              {customGradeGuideChecked && (
                <FapGradeGuide
                  fap={fap}
                  onFapUpdate={(updatedGradeGuide) => {
                    setValues({
                      ...values,
                      gradeGuide: updatedGradeGuide.gradeGuide,
                    });
                  }}
                />
              )}
              <FormControlLabel
                control={
                  <Field
                    id="customGradeGuide"
                    name="customGradeGuide"
                    component={Checkbox}
                    type="checkbox"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                    checked={values.customGradeGuide}
                    data-cy="custom-grade-guide"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      handleCustomGradeGuideChange(event);
                      setFieldValue(
                        'customGradeGuide',
                        !values.customGradeGuide
                      );
                    }}
                  />
                }
                label="Custom Grade Guide"
              />
            </Grid>
            <Grid item sm={6} xs={12}>
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
            <StyledButtonContainer>
              <Button
                disabled={isExecutingCall}
                type="submit"
                className={classes.button}
                data-cy="submit"
              >
                {isExecutingCall && <UOLoader size={14} />}
                Update Fap
              </Button>
            </StyledButtonContainer>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default FapGeneralInfo;
