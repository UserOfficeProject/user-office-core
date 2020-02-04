import Container from "@material-ui/core/Container";
import { Add } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useDataApi } from "../hooks/useDataApi";
import { useProposalData } from "../hooks/useProposalData";
import ParticipantModal from "./ParticipantModal";
import PeopleTable from "./PeopleTable";
import ProposaQuestionaryReview from "./ProposalQuestionaryReview";
import ProposalScore from "./ProposalScore";
import ReviewTable from "./ReviewTable";
import SimpleTabs from "./TabPanel";

export default function ProposalReview({ match }: { match: any }) {
  const [modalOpen, setOpen] = useState(false);
  const [reviewers, setReviewers] = useState<any>([]);
  const { proposalData } = useProposalData(parseInt(match.params.id));
  const api = useDataApi();

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

  const addUser = async (user: any) => {
    await api().addUserForReview({
      userID: user.id,
      proposalID: parseInt(match.params.id)
    });
    setReviewers([...reviewers, user]);
    setOpen(false);
  };

  const removeUser = async (user: any) => {
    let newUsers = [...reviewers];
    newUsers.splice(newUsers.indexOf(user), 1);

    setReviewers(newUsers);
    await api().removeUserForReview({
      reviewID: user.reviewID
    });
  };

  if (!proposalData) {
    return <p>Loading</p>;
  }
  return (
    <Container maxWidth="lg">
      <SimpleTabs
        tabNames={[
          "Information",
          "Reviews/Reviewers",
          "Technical",
          "Excellence",
          "Safety"
        ]}
      >
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
          />
        </>
        <ProposalScore
          technicalScore={proposalData.technicalScore}
          safetyScore={proposalData.safetyScore}
          excellenceScore={proposalData.excellenceScore}
          proposalId={proposalData.id}
        />
      </SimpleTabs>
    </Container>
  );
}
