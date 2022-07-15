import { Call } from '../../models/Call';
import EmailSettings from '../MailService/EmailSettings';
interface EmailInput {
  shortCode: string;
  startCall: Date;
  endCall: Date;
}
const templeteID = 'isis-call-created-pi';
const emailAdress = 'toprovide from env';

const callCreatedEmailEmail = (_emailInput: EmailInput): EmailSettings => ({
  content: {
    template_id: templeteID,
  },
  substitution_data: {
    shortCode: _emailInput.shortCode,
    startCall: _emailInput.startCall,
    endCall: _emailInput.endCall,
  },
  recipients: [{ address: emailAdress }],
});

export function getCallNotificationEmailSettings(_call: Call) {
  const { shortCode, startCall, endCall } = _call;
  // eslint-disable-next-line no-console
  console.log('Sending mail' + shortCode);

  return callCreatedEmailEmail({ shortCode, startCall, endCall });
}
