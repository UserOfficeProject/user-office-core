import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { FieldArray } from 'formik';
import React from 'react';

import { EmailStatusActionRecipients } from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  eventDescription: {
    margin: '-5px 0',
    fontSize: 'small',
    color: theme.palette.grey[400],
  },
}));

type EmailActionConfigProps = {
  emailStatusActionConfig: {
    recipientsWithEmailTemplate: {
      name: string;
      description: string;
      template: { id: string; name: string };
    }[];
  };
  recipients:
    | { name: EmailStatusActionRecipients; description: string | null }[]
    | null;
  emailTemplates: { id: string; name: string }[] | null;
};

const EmailActionConfig = ({
  emailStatusActionConfig: { recipientsWithEmailTemplate },
  recipients,
  emailTemplates,
}: EmailActionConfigProps) => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h6" color="black">
        Email recipients:{' '}
      </Typography>
      <FieldArray
        name="emailStatusActionConfig.recipientsWithEmailTemplate"
        render={(arrayHelpers) =>
          recipients?.map((recipient, index) => (
            <Grid key={index} container paddingX={1}>
              <Grid item sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id={recipient.name}
                      name="statusActionConfig"
                      value={recipient.name}
                      checked={
                        !!recipientsWithEmailTemplate.find(
                          (item) => item.name === recipient.name
                        )
                      }
                      data-cy={`action-recipient-${recipient.name}`}
                      onChange={(e) => {
                        if (e.target.checked) arrayHelpers.push(recipient);
                        else {
                          const idx = recipientsWithEmailTemplate.findIndex(
                            (item) => item.name === recipient.name
                          );
                          arrayHelpers.remove(idx);
                        }
                      }}
                      inputProps={{
                        'aria-label': 'primary checkbox',
                      }}
                    />
                  }
                  label={recipient.name}
                />
                <p className={classes.eventDescription}>
                  {recipient.description}
                </p>
              </Grid>
              <Grid item sm={6}>
                {recipientsWithEmailTemplate.findIndex(
                  (item) => item.name === recipient.name
                ) !== -1 && (
                  <Autocomplete
                    id="recipient-template"
                    options={emailTemplates || []}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="none"
                        label="Email template"
                      />
                    )}
                    onChange={(_event, newValue) => {
                      const idx = recipientsWithEmailTemplate.findIndex(
                        (item) => item.name === recipient.name
                      );
                      const newTemplateValue = {
                        ...recipientsWithEmailTemplate[idx],
                        template: newValue,
                      };

                      arrayHelpers.replace(idx, newTemplateValue);
                    }}
                    value={
                      recipientsWithEmailTemplate.find(
                        (item) => item.name === recipient.name
                      )?.template || null
                    }
                    data-cy="value"
                  />
                )}
              </Grid>
            </Grid>
          ))
        }
      />
    </>
  );
};

export default EmailActionConfig;
