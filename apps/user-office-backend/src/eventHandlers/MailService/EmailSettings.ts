export default interface EmailSettings {
  content: {
    template_id: string;
  };
  //substitution_data should be an object where the key-value pairs are all of type string
  substitution_data: any;
  recipients: (
    | {
        address: string;
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
