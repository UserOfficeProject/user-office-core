import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { FieldArray } from 'formik';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  eventDescription: {
    margin: '-5px 0',
    fontSize: 'small',
    color: theme.palette.grey[400],
  },
}));

type EmailActionConfigProps = {
  emailStatusActionRecipients: {
    id: string;
    description: string;
    template: { id: string; name: string };
  }[];
};

const EmailActionConfig = ({
  emailStatusActionRecipients,
}: EmailActionConfigProps) => {
  const classes = useStyles();
  const recipients = [
    {
      id: 'PI',
      description: 'Principal investigator on the proposal',
    },
    {
      id: 'CO_PROPOSERS',
      description: 'Co-proposers on the proposal',
    },
    {
      id: 'INSTRUMENT_SCIENTISTS',
      description:
        'Instrument scientists including the manager on the instrument related to the proposal',
    },
    {
      id: 'SEP_REVIEWERS',
      description: 'SEP reviewers that are assigned to review the proposal',
    },
  ];
  const emailTemplates = [
    { id: 'test-template', name: 'test template' },
    { id: 'test-template-multiple', name: 'test template multiple' },
  ];

  return (
    <>
      <Typography variant="h6" color="black">
        Email recipients:{' '}
      </Typography>
      <FieldArray
        name="emailStatusActionRecipients"
        render={(arrayHelpers) =>
          recipients?.map((recipient, index) => (
            <Grid key={index} container paddingX={1}>
              <Grid item sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id={recipient.id}
                      name="statusActionConfig"
                      value={recipient.id}
                      checked={
                        !!emailStatusActionRecipients.find(
                          (item) => item.id === recipient.id
                        )
                      }
                      data-cy={`action-recipient-${recipient.id}`}
                      onChange={(e) => {
                        if (e.target.checked) arrayHelpers.push(recipient);
                        else {
                          const idx = emailStatusActionRecipients.findIndex(
                            (item) => item.id === recipient.id
                          );
                          arrayHelpers.remove(idx);
                        }
                      }}
                      inputProps={{
                        'aria-label': 'primary checkbox',
                      }}
                    />
                  }
                  label={recipient.id}
                />
                <p className={classes.eventDescription}>
                  {recipient.description}
                </p>
              </Grid>
              <Grid item sm={6}>
                {emailStatusActionRecipients.findIndex(
                  (item) => item.id === recipient.id
                ) !== -1 && (
                  <Autocomplete
                    id="recipient-template"
                    options={emailTemplates}
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
                      const idx = emailStatusActionRecipients.findIndex(
                        (item) => item.id === recipient.id
                      );
                      const newTemplateValue = {
                        ...emailStatusActionRecipients[idx],
                        template: newValue,
                      };

                      arrayHelpers.replace(idx, newTemplateValue);
                    }}
                    value={
                      emailStatusActionRecipients.find(
                        (item) => item.id === recipient.id
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
