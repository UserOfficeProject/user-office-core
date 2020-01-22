import React, { useState, useEffect } from "react";
import ReviewTable from "./ReviewTable";
import { useProposalData } from "../hooks/useProposalData";
import { useAddUserForReview } from "../hooks/useAddUserForReview";
import { useRemoveUserForReview } from "../hooks/useRemoveUserForReview";
import SimpleTabs from "./TabPanel";
import { Add } from "@material-ui/icons";
import ParticipantModal from "./ParticipantModal";
import Container from "@material-ui/core/Container";
import PeopleTable from "./PeopleTable";
import ProposaQuestionaryReview from "./ProposalQuestionaryReview";
import ProposalScore from "./ProposalScore";


export default function ProposalReview({ match }: { match: any }) {
  const [modalOpen, setOpen] = useState(false);
  const [reviewers, setReviewers] = useState<any>([]);
  const { proposalData } = useProposalData(parseInt(match.params.id));
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
      <SimpleTabs tabNames={["Information", "Reviews/Reviewers", "Technical", "Excellence", "Safety"]}>
        <ProposaQuestionaryReview data={proposalData} />
        <>
        <ReviewTable reviews={proposalData.reviews} />
        <ParticipantModal
          show={modalOpen}
          close={setOpen}
          addParticipant={addUser}
          selectedUsers={reviewers}
          title={"Add Reviewer"}
          userRole={"REVIEWER"}
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
        /></>
        <ProposalScore technicalScore={proposalData.technicalScore} safetyScore={proposalData.safetyScore} excellenceScore={proposalData.excellenceScore} proposalId={proposalData.id} />
      </SimpleTabs>
    </Container>
  );
}
