import {
  FormControl,
  InputLabel,
  makeStyles,
  Select,
  TextField,
} from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { FormikErrors } from 'formik';
import React, { useContext, useState } from 'react';

import MultiMenuItem from 'components/common/MultiMenuItem';
import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import ProposalErrorLabel from 'components/proposal/ProposalErrorLabel';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { ShipmentContextType } from 'components/shipments/ShipmentContainer';
import { Answer, Sample } from 'generated/sdk';
import { useUserProposals } from 'hooks/proposal/useUserProposals';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { useProposalSamples } from 'hooks/sample/useProposalSamples';
import { EventType } from 'models/QuestionarySubmissionState';
import {
  ShipmentBasisFormikData,
  ShipmentSubmissionState,
} from 'models/ShipmentSubmissionState';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '100%',
    boxSizing: 'border-box',
  },
  text: {
    margin: theme.spacing(1),
  },
}));

const TextFieldNoSubmit = withPreventSubmit(TextField);

const samplesToSampleIds = (samples: Pick<Sample, 'id'>[]) =>
  samples.map((sample) => sample.id);

function QuestionaryComponentShipmentBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { proposalQuestionId },
    },
    formikProps: { errors },
  } = props;

  const fieldErrors = errors[proposalQuestionId] as FormikErrors<
    Record<string, unknown>
  >;
  const classes = useStyles();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ShipmentContextType;

  const [title, setTitle] = useState(state?.shipment.title);
  const [proposalId, setProposalId] = useState<number | null>(
    state?.shipment.proposalId || null
  );
  const [sampleIds, setSampleIds] = useState<number[]>(
    state?.shipment.samples.map((sample) => sample.id) || []
  );

  const { proposals, loadingProposals } = useUserProposals();
  const { samples, loadingSamples } = useProposalSamples(proposalId);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const handleChange = (changes: Partial<ShipmentBasisFormikData>) => {
    dispatch({
      type: EventType.SHIPMENT_MODIFIED,
      payload: {
        shipment: {
          ...state.shipment,
          ...changes,
        },
      },
    });
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <TextFieldNoSubmit
          value={title}
          label="Title"
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            handleChange({ title: event.target.value });
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(event.target.value)
          }
          required
          fullWidth
          data-cy="title-input"
        />
        <ProposalErrorLabel>{fieldErrors?.title}</ProposalErrorLabel>
      </FormControl>

      {!loadingProposals && (
        <FormControl className={classes.formControl} required>
          <InputLabel id="proposal-id">Select proposal</InputLabel>
          <Select
            labelId="proposal-id"
            onChange={(event) => {
              const newProposalId = event.target.value as number;
              setProposalId(newProposalId);
              setSampleIds([]);
              handleChange({ proposalId: newProposalId });
            }}
            value={proposalId || ''}
            fullWidth
            data-cy="select-proposal-dropdown"
          >
            {proposals.map((proposal) => (
              <MenuItem key={proposal.id} value={proposal.id}>
                {proposal.title}
              </MenuItem>
            ))}
          </Select>
          <ProposalErrorLabel>{fieldErrors?.proposalId}</ProposalErrorLabel>
        </FormControl>
      )}

      {!loadingSamples && samples.length > 0 && (
        <FormControl className={classes.formControl}>
          <InputLabel id="sample-ids">Select samples</InputLabel>
          <Select
            labelId="sample-ids"
            multiple
            onChange={(event) => {
              const newSampleIds = event.target.value as number[];
              const newSamples = samples.filter((sample) =>
                newSampleIds.includes(sample.id)
              );
              setSampleIds(newSampleIds);
              handleChange({ samples: newSamples });
            }}
            value={sampleIds}
            fullWidth
            data-cy="samples-dropdown"
          >
            {samples.map((sample) => (
              <MultiMenuItem key={sample.id} value={sample.id}>
                {sample.title}
              </MultiMenuItem>
            ))}
          </Select>
          <ProposalErrorLabel>{fieldErrors?.samples}</ProposalErrorLabel>
        </FormControl>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const shipmentBasisPreSubmit = (answer: Answer) => async ({
  api,
  dispatch,
  state,
}: SubmitActionDependencyContainer) => {
  const shipment = (state as ShipmentSubmissionState).shipment;
  const title = shipment.title;
  let shipmentId = shipment.id;
  let returnValue = state.questionaryId;
  if (shipmentId > 0) {
    const result = await api.updateShipment({
      title: title,
      shipmentId: shipment.id,
      proposalId: shipment.proposalId,
    });
    if (result.updateShipment.shipment) {
      dispatch({
        type: EventType.SHIPMENT_UPDATED,
        payload: {
          shipment: result.updateShipment.shipment,
        },
      });
    }
  } else {
    const result = await api.createShipment({
      title: title,
      proposalId: shipment.proposalId,
    });
    if (result.createShipment.shipment) {
      dispatch({
        type: EventType.SHIPMENT_CREATED,
        payload: {
          shipment: result.createShipment.shipment,
        },
      });
      shipmentId = result.createShipment.shipment.id;
      returnValue = result.createShipment.shipment.questionaryId;
    } else {
      return returnValue;
    }
  }

  await api.addSamplesToShipment({
    shipmentId: shipmentId,
    sampleIds: samplesToSampleIds(shipment.samples),
  });

  return returnValue;
};

export { QuestionaryComponentShipmentBasis, shipmentBasisPreSubmit };
