import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {
  createOAuthClientValidationSchema,
  updateOAuthClientValidationSchema,
} from '@user-office-software/duo-validation/lib/Admin';
import { Field, FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik';
import React from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import TextField from 'components/common/FormikUITextField';
import SimpleTabs from 'components/common/SimpleTabs';
import UOLoader from 'components/common/UOLoader';
import { OAuthClient, QueryMutationAndServicesGroup } from 'generated/sdk';
import { useQueriesMutationsAndServicesData } from 'hooks/admin/useQueriesMutationsAndServicesData';
import { StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type FormOAuthClient = {
  clientId: string;
  name: string;
  description: string;
  accessPermissions: string[];
};

type CreateUpdateOAuthClientProps = {
  close: (oauthClientAdded: OAuthClient | null) => void;
  oauthClient: OAuthClient | null;
};

const CreateUpdateOAuthClient = ({
  close,
  oauthClient,
}: CreateUpdateOAuthClientProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { queriesMutationsAndServices, loadingQueriesMutationsAndServices } =
    useQueriesMutationsAndServicesData();

  const normalizeAccessPermissions = (data: string | null | undefined) => {
    const permissionsArray: string[] = [];

    if (data) {
      const parsedPermissions = JSON.parse(data);

      Object.keys(parsedPermissions).forEach((key) => {
        permissionsArray.push(key);
      });
    }

    return permissionsArray;
  };

  const initialValues: FormOAuthClient = oauthClient
    ? {
        clientId: oauthClient.id,
        name: oauthClient.name,
        description: oauthClient.description ?? '',
        accessPermissions: normalizeAccessPermissions(
          oauthClient.accessPermissions
        ),
      }
    : {
        clientId: '',
        name: '',
        description: '',
        accessPermissions: [],
      };

  const allAccessPermissions = (
    groups: QueryMutationAndServicesGroup[],
    title: string,
    formValues: FormOAuthClient,
    fieldArrayHelpers: FieldArrayRenderProps
  ) => (
    <>
      {groups.map((group, index) => {
        const allSelected = group.items.every((item) =>
          formValues.accessPermissions.includes(item)
        );

        return (
          <FormControl
            component="fieldset"
            variant="standard"
            key={index}
            sx={(theme) => ({
              border: `1px solid ${theme.palette.grey[200]}`,
              padding: theme.spacing(0, 1),
              width: '100%',

              '& legend': {
                textTransform: 'capitalize',
              },
            })}
          >
            <FormLabel component="legend">
              {group.groupName} {title} (
              <Link
                component="button"
                type="button"
                onClick={() => {
                  if (allSelected) {
                    const indicesToRemove = group.items
                      .map((item) => formValues.accessPermissions.indexOf(item))
                      .filter((index) => index !== -1)
                      .sort((a, b) => b - a); //sort in descending order to avoid index shifting
                    indicesToRemove.forEach((index) =>
                      fieldArrayHelpers.remove(index)
                    );
                  } else {
                    group.items.forEach((item) => {
                      if (!formValues.accessPermissions.includes(item)) {
                        fieldArrayHelpers.push(item);
                      }
                    });
                  }
                }}
              >
                {allSelected ? 'Unselect all' : 'Select all'}
              </Link>
              )
            </FormLabel>
            <FormGroup>
              <Grid container spacing={1}>
                {group.items.map((item, index) => (
                  <Grid
                    item
                    md={6}
                    xs={12}
                    key={index}
                    sx={{
                      '& label': {
                        width: '100%',

                        '& .MuiFormControlLabel-label': {
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      },
                    }}
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
        );
      })}
    </>
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        const accessPermissions: { [key: string]: boolean } = {};

        values.accessPermissions.forEach((element) => {
          if (element) {
            accessPermissions[element] = true;
          }
        });

        if (oauthClient) {
          try {
            const { updateOAuthClient } = await api({
              toastSuccessMessage: 'OAuth client updated successfully!',
            }).updateOAuthClient({
              clientId: oauthClient.id,
              name: values.name,
              description: values.description,
              accessPermissions: JSON.stringify(accessPermissions),
            });

            close(updateOAuthClient);
          } catch {
            close(null);
          }
        } else {
          try {
            const { createOAuthClient } = await api({
              toastSuccessMessage: 'OAuth client created successfully!',
            }).createOAuthClient({
              clientId: values.clientId,
              name: values.name,
              description: values.description,
              accessPermissions: JSON.stringify(accessPermissions),
            });

            close(createOAuthClient);
          } catch {
            close(null);
          }
        }
      }}
      validationSchema={
        oauthClient
          ? updateOAuthClientValidationSchema
          : createOAuthClientValidationSchema
      }
    >
      {({ isSubmitting, values }) => (
        <Form>
          <Typography variant="h6" component="h1">
            {oauthClient ? 'Update' : 'Create new'} OAuth client
          </Typography>
          <Field
            name="clientId"
            id="clientId"
            label="Client ID"
            type="text"
            component={TextField}
            fullWidth
            data-cy="clientId"
            helperText="The client id as it is registered in the identity provider"
            disabled={isExecutingCall || !!oauthClient}
            required
          />
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
          <Field
            name="description"
            id="description"
            label="Description"
            type="text"
            component={TextField}
            fullWidth
            multiline
            data-cy="description"
            disabled={isExecutingCall}
          />

          {loadingQueriesMutationsAndServices ? (
            <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
          ) : (
            <FieldArray
              name="accessPermissions"
              render={(arrayHelpers) => (
                <StyledPaper margin={[0]} padding={[0]}>
                  <SimpleTabs tabNames={['Queries', 'Mutations', 'Services']}>
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

          <Grid
            container
            justifyContent="flex-end"
            sx={(theme) => ({ margin: theme.spacing(2, 0, 2) })}
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
                {oauthClient ? 'Update' : 'Create'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default CreateUpdateOAuthClient;
