import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React, { useContext, useMemo } from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { FapInstrument, FapInstrumentInput, UserRole } from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';
import { getUniqueArray } from 'utils/helperFunctions';

type AssignProposalToFapsProps = {
  close: () => void;
  assignProposalsToFaps: (
    fapInstruments: FapInstrumentInput[]
  ) => Promise<void>;
  proposalInstrumentIds: ((number | null)[] | null)[];
  proposalFapInstruments?: (FapInstrument | null)[];
};

const AssignProposalsToFaps = ({
  close,
  assignProposalsToFaps,
  proposalInstrumentIds,
  proposalFapInstruments,
}: AssignProposalToFapsProps) => {
  const { currentRole } = useContext(UserContext);
  const { faps, loadingFaps } = useFapsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });
  const instrumentsPerProposal = [...proposalInstrumentIds];
  const uniqueInstrumentIds = useMemo(() => {
    console.log('eeeeeeeeee');

    return getUniqueArray(proposalInstrumentIds.flat());
  }, [proposalInstrumentIds]);
  console.log(uniqueInstrumentIds);
  const { instruments, loadingInstruments } =
    useInstrumentsByIdsData(uniqueInstrumentIds);

  console.log(loadingInstruments, instruments);

  if (loadingInstruments || !instruments) {
    return <UOLoader sx={{ marginLeft: '50%', marginTop: '10px' }} />;
  }
  const allSelectedProposalsHaveSameInstruments = instrumentsPerProposal.every(
    (item) =>
      item?.sort((a, b) => (a && b ? a - b : 0)).toString() ===
      instrumentsPerProposal[0]?.sort((a, b) => (a && b ? a - b : 0)).toString()
  );

  const initialValues: Record<string, number | undefined | null> = {};

  instruments.forEach((instrument) => {
    initialValues[`selectedFapIds_${instrument.id}`] =
      proposalFapInstruments?.find((i) => i?.instrumentId === instrument.id)
        ?.fapId || null;
  });

  console.log(initialValues, proposalFapInstruments);

  const hasEmptyValue = (values: Record<string, number | undefined | null>) =>
    Object.values(values).every((v) => v !== undefined && v !== null);

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-fap-assignment"
    >
      <Formik
        initialValues={{ ...initialValues }}
        onSubmit={async (values): Promise<void> => {
          const fapInstruments: FapInstrumentInput[] =
            instruments?.map((instrument) => ({
              instrumentId: instrument.id,
              fapId: values[`selectedFapIds_${instrument.id}`] || null,
            })) || [];

          await assignProposalsToFaps(fapInstruments);
          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography variant="h6" component="h1">
              Assign proposal/s to FAP
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                {instruments.map((instrument) => (
                  <FormikUIAutocomplete
                    key={instrument.id}
                    name={`selectedFapIds_${instrument.id}`}
                    label="Select FAP"
                    loading={loadingFaps}
                    items={faps.map((fap) => ({
                      value: fap.id,
                      text: fap.code,
                    }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {instrument?.name}:
                        </InputAdornment>
                      ),
                    }}
                    disabled={isSubmitting}
                    noOptionsText="No FAPs"
                    data-cy="fap-selection"
                  />
                ))}
              </Grid>
            </Grid>

            {!instruments?.length && (
              <Alert severity="warning" data-cy="different-instruments">
                Selected proposal/s do NOT have any instruments assigned. Please
                assign instruments first and then you can select FAPs
                accordingly.
              </Alert>
            )}

            {proposalFapInstruments?.[0] && !hasEmptyValue(values) && (
              <Alert severity="warning" data-cy="remove-fap-alert">
                Be aware that leaving FAP selection empty will remove assigned
                FAP from proposal/s and delete all FAP reviews on that
                assignment.
              </Alert>
            )}

            {!allSelectedProposalsHaveSameInstruments && (
              <Alert severity="warning" data-cy="different-instruments">
                It is NOT recommended to do group assignment of FAPs to
                proposals that differ in their instruments. If you want to
                continue be aware that proposals will get FAPs assigned ONLY to
                their own instruments accordingly and not for all instruments.
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              sx={{ marginTop: (theme) => theme.spacing(3) }}
              disabled={isSubmitting || loadingFaps}
              data-cy="submit"
            >
              Save
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default AssignProposalsToFaps;
