import { CreateTransmission } from 'sparkpost';

export default interface EmailSettings extends CreateTransmission {
  content: {
    template_id: string;
  };
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
