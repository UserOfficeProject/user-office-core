import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { FieldArray, Form, Formik } from 'formik';
import React from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import UOLoader from 'components/common/UOLoader';
import {
  ConnectionHasActionsInput,
  ConnectionStatusAction,
  EmailActionConfig as EmailActionConfigType,
  EmailActionDefaultConfig,
  ProposalStatusAction,
  StatusActionType,
  RabbitMqActionDefaultConfig,
} from 'generated/sdk';
import { useStatusActionsData } from 'hooks/settings/useStatusActionsData';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';

import EmailActionConfig from './EmailActionConfig';
import RabbitMQActionConfig from './RabbitMQActionConfig';

type AddStatusActionsToConnectionProps = {
  addStatusActionsToConnection: (
    connectionActions: ConnectionHasActionsInput[]
  ) => void;
  statusName?: string;
  connectionStatusActions?: ConnectionStatusAction[] | null;
  isLoading: boolean;
};

const AddStatusActionsToConnection = ({
  addStatusActionsToConnection,
  statusName,
  connectionStatusActions,
  isLoading,
}: AddStatusActionsToConnectionProps) => {
  const theme = useTheme();
  const { statusActions, loadingStatusActions } = useStatusActionsData();

  const emailStatusActionConfig = connectionStatusActions?.find(
    (item) => item.action.type === StatusActionType.EMAIL
  )?.config as EmailActionConfigType;

  const initialValues: {
    selectedStatusActions: ProposalStatusAction[];
    emailStatusActionConfig: EmailActionConfigType;
  } = {
    selectedStatusActions:
      connectionStatusActions?.map(
        (connectionStatusAction) => connectionStatusAction.action
      ) || [],
    emailStatusActionConfig: emailStatusActionConfig || {
      recipientsWithEmailTemplate: [],
    },
  };

  const accordionSX = {
    '.MuiAccordionSummary-root': {
      '&.Mui-expanded': {
        backgroundColor: '#f3f4f6',
      },
      '&:hover': {
        backgroundColor: '#f3f4f6',
      },
    },
  };

  const renderActionsConfig = (
    statusAction: ProposalStatusAction,
    values: typeof initialValues
  ) => {
    switch (statusAction.type) {
      case StatusActionType.EMAIL: {
        return (
          <EmailActionConfig
            emailStatusActionConfig={values.emailStatusActionConfig}
            recipients={
              (statusAction.defaultConfig as EmailActionDefaultConfig)
                .recipients
            }
            emailTemplates={
              (statusAction.defaultConfig as EmailActionDefaultConfig)
                .emailTemplates
            }
            isRecipientRequired={
              !!values.selectedStatusActions.find(
                (item) => item.type === StatusActionType.EMAIL
              ) &&
              values.emailStatusActionConfig.recipientsWithEmailTemplate
                .length === 0
            }
            isEmailTemplateRequired={
              values.emailStatusActionConfig.recipientsWithEmailTemplate
                .length > 0
            }
          />
        );
      }

      case StatusActionType.RABBITMQ: {
        return (
          <RabbitMQActionConfig
            exchanges={
              (statusAction.defaultConfig as RabbitMqActionDefaultConfig)
                .exchanges
            }
          />
        );
      }
      default:
        return <>Not configured</>;
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        const connectionActions = values.selectedStatusActions.map((action) => {
          switch (action.type) {
            case StatusActionType.EMAIL: {
              const emailStatusActionConfig = {
                recipientsWithEmailTemplate:
                  values.emailStatusActionConfig.recipientsWithEmailTemplate,
              };

              return {
                actionId: action.id,
                actionType: action.type,
                config: JSON.stringify(emailStatusActionConfig),
              };
            }
            case StatusActionType.RABBITMQ: {
              const rabbitMQStatusActionConfig = {
                exchanges:
                  (
                    statusActions.find(
                      (statusAction) => statusAction.id === action.id
                    )?.defaultConfig as RabbitMqActionDefaultConfig
                  ).exchanges || [],
              };

              return {
                actionId: action.id,
                actionType: action.type,
                config: JSON.stringify(rabbitMQStatusActionConfig),
              };
            }
          }
        });

        addStatusActionsToConnection(connectionActions);
      }}
    >
      {({ isSubmitting, values }): JSX.Element => (
        <Form>
          <Typography
            sx={{
              fontSize: '20px',
              padding: '22px 0 0',
              '& .statusName': BOLD_TEXT_STYLE,
            }}
          >
            Status actions that will be executed when proposals change to{' '}
            <span className="statusName">{statusName}</span> status
          </Typography>
          <Grid
            spacing={1}
            sx={{
              minHeight: 'auto',
              maxHeight: 'calc(100vh - 315px)',
              [theme.breakpoints.only('sm')]: {
                maxHeight: 'calc(100vh - 345px)',
              },
              [theme.breakpoints.only('xs')]: {
                maxHeight: 'calc(100vh - 475px)',
              },
              overflowY: 'auto',
              overflowX: 'hidden',
              marginTop: '10px',
            }}
          >
            {loadingStatusActions ? (
              <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
            ) : (
              <FieldArray
                name="selectedStatusActions"
                render={(arrayHelpers) => (
                  <>
                    {statusActions.map((statusAction, index) => (
                      <Accordion
                        sx={accordionSX}
                        disableGutters
                        key={index}
                        expanded={
                          !!values.selectedStatusActions.find(
                            (item) => item.id === statusAction.id
                          )
                        }
                        onChange={(event) => {
                          event.preventDefault();
                          const idx = values.selectedStatusActions.findIndex(
                            (item) => item.id === statusAction.id
                          );
                          if (idx === -1) {
                            arrayHelpers.push(statusAction);
                          } else {
                            arrayHelpers.remove(idx);
                          }
                        }}
                        data-cy={`accordion-${statusAction.type}`}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`panel${index}- header`}
                          id={`panel${index}-header`}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                id={statusAction.name}
                                name="selectedStatusActions"
                                value={statusAction.id}
                                checked={
                                  !!values.selectedStatusActions.find(
                                    (item) => item.id === statusAction.id
                                  )
                                }
                                data-cy={`${statusAction.type}-status-action`}
                                inputProps={{
                                  'aria-label': 'primary checkbox',
                                }}
                              />
                            }
                            label={
                              <>
                                <p>{statusAction.name}</p>
                                <Box
                                  component="p"
                                  sx={{
                                    margin: '-5px 0',
                                    fontSize: 'small',
                                    color: theme.palette.grey[400],
                                  }}
                                >
                                  {statusAction.description}
                                </Box>
                              </>
                            }
                          />
                        </AccordionSummary>
                        <AccordionDetails>
                          {renderActionsConfig(statusAction, values)}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </>
                )}
              />
            )}
          </Grid>
          <Grid container justifyContent="flex-end" spacing={1} paddingTop={1}>
            <Grid item marginTop={1}>
              <ErrorMessage name="selectedStatusActions" />
              <ErrorMessage name="emailStatusActionConfig.recipientsWithEmailTemplate" />
            </Grid>
            <Grid item>
              <Button
                type="submit"
                disabled={isSubmitting || loadingStatusActions || isLoading}
                data-cy="submit"
              >
                {isLoading && <UOLoader size={20} />}
                Add status actions
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default AddStatusActionsToConnection;
