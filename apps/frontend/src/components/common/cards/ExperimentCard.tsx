import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PersonIcon from '@mui/icons-material/Person';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ScienceIcon from '@mui/icons-material/Science';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { UserExperiment } from 'hooks/experiment/useUserExperiments';
import { experimentPhase } from 'utils/experimentPhase';
import { getFullUserName } from 'utils/user';

import CardDetailLine, { CardDetailList } from './CardDetailLine';
import CardTaskList, { CardTaskItem } from './CardTaskList';

type ExperimentCardProps = {
  experiment: UserExperiment;
  tasks: CardTaskItem[];
};

export default function ExperimentCard({
  experiment,
  tasks,
}: ExperimentCardProps) {
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });
  const { t } = useTranslation();
  const { phase, label } = experimentPhase(
    experiment.startsAt,
    experiment.endsAt
  );
  const isRunning = phase === 'running';

  return (
    <Card
      variant="outlined"
      data-cy="experiment-card"
      sx={{
        borderLeft: isRunning ? 3 : undefined,
        borderLeftColor: isRunning ? 'primary.main' : undefined,
        overflow: 'hidden',
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 1.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              fontWeight: 500,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              color: isRunning ? 'primary.main' : 'text.secondary',
            }}
          >
            {isRunning ? (
              <RadioButtonCheckedIcon fontSize="small" />
            ) : (
              <ScheduleIcon fontSize="small" />
            )}
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {experiment.experimentId}
          </Typography>
        </Stack>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            lineHeight: 1.35,
            textWrap: 'pretty',
            marginBottom: 1.5,
          }}
        >
          {experiment.proposal.title}
        </Typography>
        <CardDetailList>
          <CardDetailLine
            icon={<CalendarMonthIcon fontSize="small" color="action" />}
            label="Dates"
          >
            {/* Each date is one unbreakable run, so the only place the value can
                wrap is after the arrow. */}
            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
              {toFormattedDateTime(experiment.startsAt)} &rarr;
            </Box>{' '}
            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
              {toFormattedDateTime(experiment.endsAt)}
            </Box>
          </CardDetailLine>
          <CardDetailLine
            icon={<ScienceIcon fontSize="small" color="action" />}
            label={t('instrument') as string}
          >
            {experiment.instrument?.name ?? 'Not assigned'}
          </CardDetailLine>
          <CardDetailLine
            icon={<FolderOpenIcon fontSize="small" color="action" />}
            label="Proposal"
          >
            {experiment.proposal.proposalId}
          </CardDetailLine>
          <CardDetailLine
            icon={<PersonIcon fontSize="small" color="action" />}
            label="Local contact"
          >
            {experiment.localContact
              ? getFullUserName(experiment.localContact)
              : 'Not assigned'}
          </CardDetailLine>
        </CardDetailList>
      </CardContent>
      <CardTaskList items={tasks} />
    </Card>
  );
}
