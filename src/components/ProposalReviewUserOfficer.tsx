import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ReviewTable from "./ReviewTable";
import { useProposalData } from "../hooks/useProposalData";
import { useAddUserForReview } from "../hooks/useAddUserForReview";
import { useRemoveUserForReview } from "../hooks/useRemoveUserForReview";

import { Add } from "@material-ui/icons";
import ParticipantModal from "./ParticipantModal";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import PeopleTable from "./PeopleTable";
import ProposaQuestionaryReview from "./ProposalQuestionaryReview";

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3)
    }
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  }
}));

export default function ProposalReview({ match }: { match: any }) {
  const classes = useStyles();
  const [modalOpen, setOpen] = useState(false);
  const [reviewers, setReviewers] = useState<any>([]);
  const { proposalData } = useProposalData(match.params.id);
  const sendAddReviewer = useAddUserForReview();
  const sendRemoveReviewer = useRemoveUserForReview();

  useEffect(() => {
    if (proposalData) {
      setReviewers(
        proposalData.reviews!.map((review: any) => {
          const { firstname, lastname, id, username } = review.reviewer;
          return {
            firstname,
            lastname,
            username,
            id,
            reviewID: review.id
          };
        })
      );
    }
  }, [proposalData]);

  const addUser = (user: any) => {
    sendAddReviewer(user.id, parseInt(match.params.id));
    setReviewers([...reviewers, user]);
    setOpen(false);
  };

  const removeUser = (user: any) => {
    let newUsers = [...reviewers];
    newUsers.splice(newUsers.indexOf(user), 1);
    setReviewers(newUsers);
    sendRemoveReviewer(user.reviewID);
  };

  if (!proposalData) {
    return <p>Loading</p>;
  }

  return (
    <Container maxWidth="lg">
      <Paper className={classes.paper}>
        <ProposaQuestionaryReview data={proposalData} />
      </Paper>
      <Paper className={classes.paper}>
        <ReviewTable reviews={proposalData.reviews} />
      </Paper>
      <Paper className={classes.paper}>
        <ParticipantModal
          show={modalOpen}
          close={setOpen}
          addParticipant={addUser}
        />
        <PeopleTable
          title="Reviewers"
          actionIcon={<Add />}
          action={() => setOpen(true)}
          isFreeAction={true}
          data={reviewers}
          search={false}
          onRemove={removeUser}
          disabled={true}
        />
      </Paper>
    </Container>
  );
}
