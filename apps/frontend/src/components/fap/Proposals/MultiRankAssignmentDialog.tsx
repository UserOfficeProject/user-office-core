import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { ChangeEvent } from 'react';

import { BasicUserDetails } from 'generated/sdk';

import { FapAssignedMember } from './AssignFapMemberToProposalModal';

type MultiRankAssignmentDialogProps = {
  users: BasicUserDetails[];
  open: boolean;
  setOpen: (open: boolean) => void;
  assign: (usersWithRank: FapAssignedMember[]) => void;
};

type BasicUserDetailsWithRank = BasicUserDetails & {
  rank: number | null; // Rank can be null if not assigned
};

export const MultiRankAssignmentDialog = ({
  users,
  open,
  setOpen,
  assign,
}: MultiRankAssignmentDialogProps) => {
  const theme = useTheme();

  const [usersWithRank, setUsersWithRank] = React.useState<
    BasicUserDetailsWithRank[]
  >(
    users.map((user) => ({
      ...user,
      rank: null,
    }))
  );

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
      data-cy="multi-rank-assignment-dialog"
    >
      <DialogTitle>Mass Assignments with Ranking</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
          margin={2}
        >
          Please assign a unique rank to each user, Ranks must be whole numbers
          and greater than 1.
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="rank-table">
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell align="left">Surname</TableCell>
                <TableCell align="right">Rank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersWithRank.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: usersWithRank.some(
                      (user) =>
                        user.id !== row.id &&
                        user.rank === row.rank &&
                        row.rank !== null
                    )
                      ? theme.palette.error.light
                      : 'inherit',
                  }}
                >
                  <TableCell component="th" scope="row">
                    {row.preferredname ? row.preferredname : row.firstname}
                  </TableCell>
                  <TableCell align="left">{row.lastname}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      variant="outlined"
                      data-cy={`rank-${row.lastname}`}
                      InputProps={{
                        inputProps: { min: 1, step: 1 },
                      }}
                      error={
                        usersWithRank.some(
                          (user) =>
                            user.id !== row.id &&
                            user.rank === row.rank &&
                            row.rank !== null
                        ) ||
                        (row.rank !== null && row.rank < 1) ||
                        (row.rank !== null && isNaN(row.rank))
                      }
                      sx={{ width: 100 }}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const rank = Number(e.target.value); // Non numeric values become 0

                        setUsersWithRank((prev) =>
                          prev.map((user) =>
                            user.id === row.id
                              ? {
                                  ...user,
                                  rank: !Number.isInteger(rank) ? 0 : rank,
                                } // If integer, set to 0 (invalid)
                              : user
                          )
                        );
                      }}
                      required
                      fullWidth
                      margin="none"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpen(false);
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setOpen(false);
            assign(usersWithRank);
          }}
          color="primary"
          data-cy="save-ranks"
          disabled={
            usersWithRank.some((user) => user.rank === null) ||
            usersWithRank.some((user) => user.rank !== null && user.rank < 1) ||
            usersWithRank.some(
              (user) => user.rank !== null && !Number.isInteger(user.rank)
            ) ||
            new Set(
              usersWithRank
                .filter((user) => user.rank !== null)
                .map((user) => user.rank)
            ).size !== usersWithRank.length
          } // Disable if any rank is null, less than 1, NaN, or not unique
        >
          Submit Mass Assignments
        </Button>
      </DialogActions>
    </Dialog>
  );
};
