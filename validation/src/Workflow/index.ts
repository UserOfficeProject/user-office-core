import * as Yup from 'yup';

export const createWorkflowValidationSchema = Yup.object().shape({
  name: Yup.string().max(50).required(),
  description: Yup.string().max(200).required(),
  entityType: Yup.string().oneOf(['PROPOSAL', 'EXPERIMENT']).required(),
});

export const updateWorkflowValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  name: Yup.string().max(50).required(),
  description: Yup.string().max(200).required(),
});

export const deleteWorkflowValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
});

export const addWorkflowStatusValidationSchema = Yup.object().shape({
  workflowId: Yup.number().required(),
  sortOrder: Yup.number().required(),
  droppableGroupId: Yup.string().required(),
  parentDroppableGroupId: Yup.string().nullable().notRequired(),
  statusId: Yup.number().required(),
  nextStatusId: Yup.number().nullable().notRequired(),
  prevStatusId: Yup.number().nullable().notRequired(),
});

export const moveWorkflowStatusValidationSchema = Yup.object().shape({
  from: Yup.number().required(),
  to: Yup.number().required(),
  workflowId: Yup.number().required(),
});

export const deleteWorkflowStatusValidationSchema = Yup.object().shape({
  workflowStatusId: Yup.number().required(),
});

export const addNextStatusEventsValidationSchema = Yup.object().shape({
  workflowConnectionId: Yup.number().required(),
  statusChangingEvents: Yup.array().of(Yup.string()).required(),
});

export const addStatusActionsToConnectionValidationSchema = <T, U>(
  emailStatusActionType: T,
  rabbitMQStatusActionType: T,
  proposalDownloadStatusActionType: T,
  statusActionTypes: T[],
  otherEmailActionRecipients: U
) =>
  Yup.object().shape({
    connectionId: Yup.number().required(),
    workflowId: Yup.number().required(),
    actions: Yup.array()
      .of(
        Yup.object().shape({
          actionId: Yup.number().required(),
          actionType: Yup.mixed<T>().oneOf(statusActionTypes).required(),
          config: Yup.object().test(
            'RecipientWithTemplate',
            'Invalid values provided for action config',
            async (value: any, context: any) => {
              switch (context.parent.actionType) {
                case emailStatusActionType: {
                  // NOTE: Value here is: EmailActionConfig from the core codebase
                  if (value.recipientsWithEmailTemplate?.length) {
                    const filteredNonCompleteValues =
                      value.recipientsWithEmailTemplate.filter(
                        (item: any) =>
                          !item.recipient?.name || !item.emailTemplate?.id
                      );

                    if (filteredNonCompleteValues.length) {
                      return false;
                    }

                    const foundOtherRecipient =
                      value.recipientsWithEmailTemplate.find(
                        (recipientWithEmailTemplate: any) =>
                          recipientWithEmailTemplate.recipient.name ===
                          otherEmailActionRecipients
                      );

                    // NOTE: Check if 'OTHER' is selected as recipient and valid emails are provided as input.
                    if (foundOtherRecipient) {
                      await Yup.array()
                        .of(
                          Yup.string().email(
                            ({ value }) => `${value} is not a valid email`
                          )
                        )
                        .min(1, 'You must provide at least 1 valid email')
                        .required()
                        .validate(foundOtherRecipient.otherRecipientEmails);
                    }

                    return true;
                  } else {
                    return false;
                  }
                }
                case rabbitMQStatusActionType: {
                  // NOTE: Value here is: RabbitMQActionConfig from the core codebase
                  if (value.exchanges?.length) {
                    return true;
                  } else {
                    return false;
                  }
                }
                case proposalDownloadStatusActionType: {
                  // Proposal download action has no config
                  return value === null || value === undefined;
                }
                default:
                  return false;
              }
            }
          ),
        })
      )
      .notRequired(),
  });
