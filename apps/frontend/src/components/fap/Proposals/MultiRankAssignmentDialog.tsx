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
      <DialogTitle>Assign Multiple Ranks</DialogTitle>
      <DialogContent>
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
                    {row.firstname}
                  </TableCell>
                  <TableCell align="left">{row.lastname}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      data-cy={`rank-${row.lastname}`}
                      InputProps={{
                        inputProps: { min: 1 },
                      }}
                      error={usersWithRank.some(
                        (user) =>
                          user.id !== row.id &&
                          user.rank === row.rank &&
                          row.rank !== null
                      )}
                      //TOTO Highlight conflivting ranks
                      sx={{ width: 100 }}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setUsersWithRank((prev) =>
                          prev.map((user) =>
                            user.id === row.id
                              ? { ...user, rank: Number(e.target.value) }
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
            assign(usersWithRank);
          }}
          color="primary"
          data-cy="save-ranks"
        >
          Save Assignments
        </Button>
      </DialogActions>
    </Dialog>
  );
};
