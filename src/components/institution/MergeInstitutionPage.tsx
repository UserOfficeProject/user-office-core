import MergeType from '@mui/icons-material/MergeType';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import UOLoader from 'components/common/UOLoader';
import { Institution } from 'generated/sdk';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import InstitutionSelect from './InstitutionSelect';

type MergeInstitutionPageProps = {
  confirm: WithConfirmType;
};
const useStyles = makeStyles(() => ({
  mergeIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -30%)  rotate(90deg)',
    fontSize: '5em',
    color: '#999999',
  },
  mergeGridIcon: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function MergeInstitutionsPage({ confirm }: MergeInstitutionPageProps) {
  const { institutionId: institutionIdQueryParam } = useParams<{
    institutionId: string;
  }>();
  const institutionId = parseInt(institutionIdQueryParam); // param is string

  const { institutions, loadingInstitutions, setInstitutions } =
    useInstitutionsData();

  const [institutionFrom, setInstitutionFrom] =
    React.useState<Institution | null>(null);
  const [institutionInto, setInstitutionInto] =
    React.useState<Institution | null>(null);
  const [mergedInstitutionName, setMergedInstitutionName] = React.useState('');

  const { api } = useDataApiWithFeedback();
  const classes = useStyles();

  useEffect(() => {
    if (institutionFrom === null && institutionId) {
      setInstitutionFrom(
        institutions.find((i) => i.id === institutionId) || null
      );
    }
  }, [institutions, institutionId, institutionFrom]);

  if (loadingInstitutions) {
    return <UOLoader />;
  }

  return (
    <StyledContainer>
      <StyledPaper>
        <Grid container>
          <Grid item xs={12}>
            <h1>Merge Institutions</h1>
            Merge two institutions into one. All the relevant data from both
            institutions will be merged.
          </Grid>
          <Grid item xs={5}>
            <InstitutionSelect
              id="select-from-institution"
              data-cy="select-from-institution"
              label="Institution A"
              institutions={institutions}
              onInstitutionSelected={(institution) => {
                setInstitutionFrom(institution);
                if (institution?.id === institutionInto?.id) {
                  setInstitutionInto(null);
                }
              }}
              value={institutionFrom}
            />
            <InstitutionSelect
              id="select-to-institution"
              data-cy="select-to-institution"
              label="Institution B"
              institutions={institutions.filter(
                (institution) => institution.id !== institutionFrom?.id
              )}
              onInstitutionSelected={(institution) => {
                setInstitutionInto(institution);
                if (institution) {
                  setMergedInstitutionName(institution.name);
                }
              }}
              value={institutionInto}
            />
          </Grid>
          <Grid item xs={1} style={{ position: 'relative' }}>
            <MergeType className={classes.mergeIcon} />
          </Grid>
          <Grid item xs={6} className={classes.mergeGridIcon}>
            <TextField
              fullWidth
              label="Merged Institution Name"
              id="merged-institution-name"
              value={mergedInstitutionName}
              onChange={(e) => setMergedInstitutionName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <ActionButtonContainer>
              <Button
                type="button"
                disabled={
                  institutionFrom === null ||
                  institutionInto === null ||
                  mergedInstitutionName === ''
                }
                onClick={() => {
                  if (
                    !institutionFrom ||
                    !institutionInto ||
                    !mergedInstitutionName
                  ) {
                    return;
                  }
                  confirm(
                    () => {
                      api({ toastSuccessMessage: 'Institutions merged' })
                        .mergeInstitutions({
                          institutionIdFrom: institutionFrom.id,
                          institutionIdInto: institutionInto.id,
                          newTitle: mergedInstitutionName,
                        })
                        .then((result) => {
                          const mergedInstitution =
                            result.mergeInstitutions.institution;
                          if (!mergedInstitution) {
                            return;
                          }
                          setInstitutions(
                            institutions
                              .filter(
                                (institution) =>
                                  institution.id !== institutionFrom.id
                              ) // remove deleted institution
                              .map((institution) =>
                                institution.id === mergedInstitution.id
                                  ? mergedInstitution
                                  : institution
                              )
                          ); // update merged institution);
                          setInstitutionFrom(null);
                          setInstitutionInto(mergedInstitution);
                        });
                    },
                    {
                      title: 'This cannot be undone?',
                      description: `Are you sure you want to merge ${institutionFrom.name} with ${institutionInto.name} with new name ${mergedInstitutionName}?`,
                    }
                  )();
                }}
                data-cy="merge-institutions"
              >
                Merge
              </Button>
            </ActionButtonContainer>
          </Grid>
        </Grid>
      </StyledPaper>
    </StyledContainer>
  );
}

export default withConfirm(MergeInstitutionsPage);
