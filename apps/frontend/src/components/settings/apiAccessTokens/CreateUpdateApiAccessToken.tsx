import FileCopyIcon from '@mui/icons-material/FileCopy';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import {
  createApiAccessTokenValidationSchema,
  updateApiAccessTokenValidationSchema,
} from '@user-office-software/duo-validation/lib/Admin';
import { Field, FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik';
import React from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import SimpleTabs from 'components/common/SimpleTabs';
import UOLoader from 'components/common/UOLoader';
import {
  PermissionsWithAccessToken,
  QueryMutationAndServicesGroup,
  QueryMutationAndServicesGroups,
} from 'generated/sdk';
import { useQueriesMutationsAndServicesData } from 'hooks/admin/useQueriesMutationsAndServicesData';
import { StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  formControlGroup: {
    border: `1px solid ${theme.palette.grey[200]}`,
    padding: theme.spacing(0, 1),
    width: '100%',

    '& legend': {
      textTransform: 'capitalize',
    },
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  submitContainer: {
    margin: theme.spacing(2, 0, 2),
  },
  darkerDisabledTextField: {
    '& input': {
      paddingRight: theme.spacing(0.5),
      color: 'rgba(0, 0, 0, 0.7)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  checkBoxLabelText: {
    '& label': {
      width: '100%',

      '& .MuiFormControlLabel-label': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
  },
}));

type FormPermissionsWithAccessToken = {
  name: string;
  accessPermissions: string[];
  accessToken: string;
};

type CreateUpdateApiAccessTokenProps = {
  close: (
    apiAccessTokenAdded: PermissionsWithAccessToken | null,
    shouldCloseAfterCreation?: boolean
  ) => void;
  apiAccessToken: PermissionsWithAccessToken | null;
};

const CreateUpdateApiAccessToken = ({
  close,
  apiAccessToken,
}: CreateUpdateApiAccessTokenProps) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { queriesMutationsAndServices, loadingQueriesMutationsAndServices } =
    useQueriesMutationsAndServicesData();

  const normalizeAccessPermissions = (data: string | undefined) => {
    const permissionsArray: string[] = [];

    if (data) {
      const parsedPermissions = JSON.parse(data);

      Object.keys(parsedPermissions).forEach((key) => {
        permissionsArray.push(key);
      });
    }

    return permissionsArray;
  };

  const initialValues: FormPermissionsWithAccessToken = apiAccessToken
    ? {
        ...apiAccessToken,
        accessToken: `Bearer ${apiAccessToken.accessToken}`,
        accessPermissions: normalizeAccessPermissions(
          apiAccessToken?.accessPermissions
        ),
      }
    : {
        name: '',
        accessPermissions: normalizeAccessPermissions(''),
        accessToken: '',
      };

  const allAccessPermissions = (
    groups: QueryMutationAndServicesGroup[],
    title: string,
    formValues: FormPermissionsWithAccessToken,
    fieldArrayHelpers: FieldArrayRenderProps
  ) => {
    const corePermissionsForSchedulerAPIAccess =
      'AdminQueries.getTokenAndPermissionsById';
    const isCorePermissionEnabled = formValues.accessPermissions.includes(
      corePermissionsForSchedulerAPIAccess
    );

    const schedulerAlert = (group: QueryMutationAndServicesGroup) =>
      group.groupName === QueryMutationAndServicesGroups.SCHEDULER &&
      !isCorePermissionEnabled && (
        <Alert severity="warning" data-cy="scheduler-access-alert">
          For Scheduler API access to work you need to have
          <b> {corePermissionsForSchedulerAPIAccess}</b> permissions enabled on
          the core.
          <Button
            variant="text"
            onClick={() =>
              fieldArrayHelpers.push(corePermissionsForSchedulerAPIAccess)
            }
          >
            Enable it here
          </Button>
        </Alert>
      );

    return (
      <>
        {groups.map((group, index) => (
          <FormControl
            component="fieldset"
            variant="standard"
            key={index}
            className={classes.formControlGroup}
          >
            <FormLabel component="legend">
              {group.groupName} {title} (
              <Link
                component="button"
                type="button"
                onClick={() => {
                  group.items.forEach((item) => fieldArrayHelpers.push(item));
                }}
              >
                Select all
              </Link>
              )
            </FormLabel>
            <FormGroup>
              {schedulerAlert(group)}
              <Grid container spacing={1}>
                {group.items.map((item, index) => (
                  <Grid
                    item
                    md={6}
                    xs={12}
                    key={index}
                    className={classes.checkBoxLabelText}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={item}
                          name="accessPermissions"
                          value={item}
                          checked={formValues.accessPermissions.includes(item)}
                          data-cy={`permission-${title.toLowerCase()}`}
                          onChange={(e) => {
                            if (e.target.checked) {
                              fieldArrayHelpers.push(item);
                            } else {
                              const idx =
                                formValues.accessPermissions.indexOf(item);
                              fieldArrayHelpers.remove(idx);
                            }
                          }}
                          inputProps={{
                            'aria-label': 'primary checkbox',
                          }}
                        />
                      }
                      label={item}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </FormControl>
        ))}
      </>
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, formikHelpers): Promise<void> => {
        const accessPermissions: { [key: string]: boolean } = {};

        values.accessPermissions.forEach((element) => {
          if (element) {
            accessPermissions[element] = true;
          }
        });

        if (apiAccessToken) {
          try {
            const { updateApiAccessToken } = await api({
              toastSuccessMessage: 'Api access token updated successfully!',
            }).updateApiAccessToken({
              accessTokenId: apiAccessToken.id,
              name: values.name,
              accessPermissions: JSON.stringify(accessPermissions),
            });

            close(updateApiAccessToken);
          } catch (error) {
            close(null);
          }
        } else {
          try {
            const { createApiAccessToken } = await api({
              toastSuccessMessage: 'Api access token created successfully!',
            }).createApiAccessToken({
              ...values,
              accessPermissions: JSON.stringify(accessPermissions),
            });

            formikHelpers.setFieldValue(
              'accessToken',
              `Bearer ${createApiAccessToken.accessToken}`
            );

            close(createApiAccessToken, false);
          } catch (error) {
            close(null);
          }
        }
      }}
      validationSchema={
        apiAccessToken
          ? updateApiAccessTokenValidationSchema
          : createApiAccessTokenValidationSchema
      }
    >
      {({ isSubmitting, values }) => (
        <Form>
          <Typography variant="h6" component="h1">
            {apiAccessToken ? 'Update' : 'Create new'} api access token
          </Typography>
          <Field
            name="name"
            id="name"
            label="Name"
            type="text"
            component={TextField}
            fullWidth
            data-cy="name"
            disabled={isExecutingCall}
            required
          />

          {loadingQueriesMutationsAndServices ? (
            <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
          ) : (
            <FieldArray
              name="accessPermissions"
              render={(arrayHelpers) => (
                <StyledPaper margin={[0]} padding={[0]}>
                  <SimpleTabs
                    tabNames={['Queries', 'Mutations', 'Other Services']}
                  >
                    {allAccessPermissions(
                      queriesMutationsAndServices.queries,
                      'Queries',
                      values,
                      arrayHelpers
                    )}
                    {allAccessPermissions(
                      queriesMutationsAndServices.mutations,
                      'Mutations',
                      values,
                      arrayHelpers
                    )}
                    {allAccessPermissions(
                      queriesMutationsAndServices.services,
                      'Services',
                      values,
                      arrayHelpers
                    )}
                  </SimpleTabs>
                </StyledPaper>
              )}
            />
          )}
          <Field
            name="accessToken"
            id="accessToken"
            label="Access token"
            type="text"
            component={TextField}
            fullWidth
            className={classes.darkerDisabledTextField}
            InputProps={{
              endAdornment: values.accessToken && (
                <>
                  <Tooltip title="Copy">
                    <IconButton
                      edge="start"
                      onClick={() =>
                        navigator.clipboard.writeText(values.accessToken)
                      }
                    >
                      <FileCopyIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ),
            }}
            data-cy="accessToken"
            disabled
          />
          <Grid
            container
            justifyContent="flex-end"
            className={classes.submitContainer}
          >
            <Grid item>
              <ErrorMessage name="accessPermissions" />

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  loadingQueriesMutationsAndServices ||
                  isExecutingCall
                }
                data-cy="submit"
              >
                {isExecutingCall && <UOLoader size={14} />}
                {values.accessToken ? 'Update' : 'Create'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default CreateUpdateApiAccessToken;
