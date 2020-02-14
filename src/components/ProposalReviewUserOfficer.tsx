import Container from "@material-ui/core/Container";
import { Add } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useDataApi } from "../hooks/useDataApi";
import { useProposalData } from "../hooks/useProposalData";
import ParticipantModal from "./ParticipantModal";
import PeopleTable from "./PeopleTable";
import ProposaQuestionaryReview from "./ProposalQuestionaryReview";
import ProposalTechnicalReview from "./ProposalTechnicalReview";
import ReviewTable from "./ReviewTable";
import SimpleTabs from "./TabPanel";
import { ButtonContainer } from "../styles/StyledComponents";
import Button from "@material-ui/core/Button";
import { TechnicalReview } from "../generated/sdk";

export default function ProposalReview({ match }: { match: any }) {
  const [modalOpen, setOpen] = useState(false);
  const [reviewers, setReviewers] = useState<any>([]);
  const [techReview, setTechReview] = useState<TechnicalReview | null | undefined>(null);
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
      setTechReview(proposalData.technicalReview)
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
          "Reviews",
          "Technical",
          "Reviewers"
        ]}
      >
        <ProposaQuestionaryReview data={proposalData} />
        <ReviewTable reviews={proposalData.reviews} />
        <ProposalTechnicalReview data={techReview} setReview={setTechReview}/>
        <>
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
            <ButtonContainer>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Update
              </Button>
              </ButtonContainer>
        </>
      </SimpleTabs>
    </Container>
  );
}
