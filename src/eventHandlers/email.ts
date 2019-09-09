import { ApplicationEvent } from "../events/applicationEvents";
import { UserDataSource } from "../datasources/UserDataSource";
const SparkPost = require("sparkpost");
const options = {
  endpoint: "https://api.eu.sparkpost.com:443"
};
const client = new SparkPost(
  "912cf7ccce97c1bacf463658cabe75e6629c397f",
  options
);

const createEmail = (title: string, buttonText: string, link: string) => {
  return `<!DOCTYPE html>
  <html>
  <head>
  <style>
  *{
  font-family: "Titillium Web", "Helvetica Neue", sans-serif;
  text-align: center;
  }
  button{
  padding: 1rem;
  width: 200px;
  color: white;
  background-color: #009EDD;
  }
  hr{
  background-color: #009EDD;
  border: solid #009EDD 1px;
  color: #009EDD;
  width: 80%;
  }
  footer{
  margin-top: 5rem;
  }
  </style>
  </head>
  <body>
  <header>
  <h3>${title}</h3>
  </header>
  <hr>
  <a href="${link}}">
  <button>
    ${buttonText}
  </button>
  </a>
  <footer>
  <small>You received this email because you registered an account at https://demax.esss.se.</small>
  </footer>
  </body>
  </html>`;
};

export default function createHandler(userDataSource: UserDataSource) {
  // Handler to send email to proposers in accepted proposal

  return async function emailHandler(event: ApplicationEvent) {
    function sendEmail(_address: string, _topic: string, _message: string) {}

    switch (event.type) {
      case "PROPOSAL_ACCEPTED": {
        const proposal = event.proposal;
        const participants = await userDataSource.getProposalUsers(proposal.id);

        for (const { firstname, lastname } of participants) {
          const email = "dummy@dummy.com";
          const topic = "Congrats!";
          const message = `Dear ${firstname} ${lastname}, your proposal has been accepted.`;
          sendEmail(email, topic, message);
        }

        return;
      }

      case "PROPOSAL_REJECTED": {
        const proposal = event.proposal;
        const participants = await userDataSource.getProposalUsers(proposal.id);

        for (const { firstname, lastname } of participants) {
          const email = "dummy@dummy.com";
          const topic = "Tough luck!";
          const message = `Sorry ${firstname} ${lastname}, your proposal was rejected because: ${event.reason}`;
          sendEmail(email, topic, message);
        }

        return;
      }

      case "PASSWORD_RESET_EMAIL": {
        client.transmissions
          .send({
            options: {
              sandbox: true
            },
            content: {
              from: "testing@sparkpostbox.com",
              subject: "Hello, World!",
              html: createEmail(
                "ESS User portal reset password",
                "Click to reset password",
                event.link
              )
            },
            recipients: [{ address: "bolmsten@gmail.com" }]
          })
          .then((res: string) => {
            console.log(res);
          })
          .catch((err: string) => {
            console.log(err);
          });
        return;
      }

      case "ACCOUNT_CREATED": {
        client.transmissions
          .send({
            options: {
              sandbox: true
            },
            content: {
              from: "testing@sparkpostbox.com",
              subject: "Hello, World!",
              html: createEmail(
                "ESS User portal reset password",
                "Click to reset password",
                "XXXX  Link for Account email verification XXXXXX"
              )
            },
            recipients: [{ address: "bolmsten@gmail.com" }]
          })
          .then((res: string) => {
            console.log(res);
          })
          .catch((err: string) => {
            console.log(err);
          });
        return;
      }
    }
  };
}
