import Container from "@material-ui/core/Container";
import { Add } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { Proposal, TechnicalReview } from "../../generated/sdk";
import { useDataApi } from "../../hooks/useDataApi";
import SimpleTabs from "../common/TabPanel";
import GeneralInformation from "../proposal/GeneralInformation";
import ParticipantModal from "../proposal/ParticipantModal";
import ProposalAdmin from "../proposal/ProposalAdmin";
import PeopleTable from "../user/PeopleTable";
import ProposalTechnicalReview from "./ProposalTechnicalReview";
import ReviewTable from "./ReviewTable";

export default function ProposalReview({ match }: { match: any }) {
  const [modalOpen, setOpen] = useState(false);
  const [reviewers, setReviewers] = useState<any>([]);
  const [techReview, setTechReview] = useState<
    TechnicalReview | null | undefined
  >(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const api = useDataApi();

  useEffect(() => {
    if (proposal) {
      setReviewers(
        proposal.reviews!.map((review: any) => {
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
      setTechReview(proposal.technicalReview);
    }
  }, [proposal]);

  useEffect(() => {
    api()
      .getProposal({ id: parseInt(match.params.id) })
      .then(data => setProposal(data.proposal));
  }, [api, match.params.id]);

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

  if (!proposal) {
    return <p>Loading</p>;
  }
  return (
    <Container maxWidth="lg">
      <SimpleTabs
        tabNames={["General", "Reviews", "Technical", "Reviewers", "Admin"]}
      >
        <GeneralInformation
          data={proposal}
          onProposalChanged={newProposal => setProposal(newProposal)}
        />
        <ReviewTable reviews={proposal.reviews} />
        <ProposalTechnicalReview
          id={proposal.id}
          data={techReview}
          setReview={setTechReview}
        />
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
        </>
        <ProposalAdmin id={proposal.id} />
      </SimpleTabs>
    </Container>
  );
}
