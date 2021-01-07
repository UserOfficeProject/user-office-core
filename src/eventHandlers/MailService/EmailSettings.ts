export default interface EmailSettings {
  content: {
    template_id: string;
  };
  substitution_data: {
    piPreferredname: string | undefined;
    piLastname: string;
    proposalNumber: string;
    proposalTitle: string;
    coProposers: string[];
    call: string;
  };
  recipients: (
    | {
        address: {
          email: string;
        };
      }
    | {
        address: {
          email: string;
          header_to: string;
        };
      }
  )[];
  // eslint-disable-next-line semi
}
