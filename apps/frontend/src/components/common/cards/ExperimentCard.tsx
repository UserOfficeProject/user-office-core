import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ScienceIcon from '@mui/icons-material/Science';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import React from 'react';

import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { UserExperiment } from 'hooks/experiment/useUserExperiments';
import { experimentPhase } from 'utils/experimentPhase';
import { getFullUserName } from 'utils/user';

import CardDetailLine from './CardDetailLine';
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
      <Box sx={{ padding: 2, paddingBottom: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
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
              '& .MuiSvgIcon-root': { fontSize: 16 },
            }}
          >
            {isRunning ? (
              <RadioButtonCheckedIcon aria-hidden />
            ) : (
              <ScheduleIcon aria-hidden />
            )}
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {experiment.experimentId}
          </Typography>
        </Box>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <CardDetailLine icon={<CalendarMonthIcon />}>
            {toFormattedDateTime(experiment.startsAt)} &rarr;{' '}
            {toFormattedDateTime(experiment.endsAt)}
          </CardDetailLine>
          <CardDetailLine icon={<ScienceIcon />}>
            {experiment.instrument?.name
              ? `${experiment.instrument.name} · proposal ${experiment.proposal.proposalId}`
              : `Proposal ${experiment.proposal.proposalId}`}
          </CardDetailLine>
          <CardDetailLine icon={<PersonIcon />}>
            {experiment.localContact
              ? `${getFullUserName(experiment.localContact)}, local contact`
              : 'No local contact assigned'}
          </CardDetailLine>
        </Box>
      </Box>
      <CardTaskList items={tasks} />
    </Card>
  );
}
