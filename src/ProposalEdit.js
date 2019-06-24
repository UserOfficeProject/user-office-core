import React, { useState, useEffect } from 'react';
import { request } from 'graphql-request'
import ProposalContainer from './ProposalContainer';

export default function ProposalEdit({match}) {

  const [proposalData, setProposalData] = useState({});
  const [loading, setLoading] = useState(true);

  const getProposalInformation = (id) => {
    
    const query = `
    query($id: ID!) {
      proposal(id: $id) {
        id
        title
        abstract
        status
        users{
          firstname
          lastname
          id
          roles
        }
      }
    }
    `;

    const variables = {
      id
    }
      request('/graphql', query, variables).then(data => {
        setProposalData({
          title: data.proposal.title,
          abstract: data.proposal.abstract,
          id: data.proposal.id,
          status: data.proposal.status,
          users: data.proposal.users.map((user) => {return {name: user.firstname, surname: user.lastname, username: user.id}})
        })
        setLoading(false);
      });
  }


  useEffect(() => {
    getProposalInformation(match.params.proposalID);
  }, [match.params.proposalID]);

  if(loading){
      return <p>Loading</p>
  }
  return (
    <ProposalContainer data={proposalData} /> 
  );
}

