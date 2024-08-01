import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import React from 'react';

const documentation: {
  [key: string]: {
    [key: string]:
      | string
      | {
          [key: string]: string;
        };
  };
} = {
  proposal: {
    primaryKey: 'Primary Key of the Proposal',
    title: 'Title of the Proposal',
    abstract: 'Abstract of the Proposal',
    proposerId: 'UserId of the Proposer',
    statusId: 'Proposal Status Number',
    created: 'Proposal Created Date Time',
    updated: 'Proposal Updated Date Time',
    proposalId: 'Proposal Number',
    finalStatus: 'UNSET = 0,ACCEPTED=1,RESERVED=2,REJECTED=3',
    callId: "ID of the Proposal's Call",
    questionaryId: "ID of the Proposal's Questionary",
    commentForUser: "User's Comment",
    commentForManagement: "Management's Comment",
    notified: 'TRUE - Yes, FALSE - No',
    submitted: 'TRUE - Yes, FALSE - No',
    referenceNumberSequence: 'Sequence Number of the Reference',
    managementTimeAllocation: 'Time allocated by the Management',
    managementDecisionSubmitted: 'TRUE - Yes, FALSE - No',
  },
  principalInvestigator: {
    id: 'ID of the Principal Investigator',
    firstname: 'First Name of the Principal Investigator',
    lastname: 'Last Name of the Principal Investigator',
    preferredname: 'Preferred Name of the Principal Investigator',
    institution: 'Institution of the Principal Investigator',
    institutionId: 'ID of the Institution',
    position: 'Position of the Principal Investigator',
    created: 'Creation date of the Principal Investigator',
    placeholder: 'Placeholder of the Principal Investigator',
    email: 'Email of the Principal Investigator',
  },
  coProposers: {
    id: 'ID of the Co-Proposer',
    firstname: 'First Name of the Co-Proposer',
    lastname: 'Last Name of the Co-Proposer',
    preferredname: 'Preferred Name of the Co-Proposer',
    institution: 'Institution of the Co-Proposer',
    institutionId: 'ID of the Institution',
    position: 'Position of the Co-Proposer',
    created: 'Creation date of the Co-Proposer',
    placeholder: 'Placeholder of the Co-Proposer',
    email: 'Email of the Co-Proposer',
  },
  attachments: {
    id: 'Attachment ID',
    figure: 'Attachment Figure',
    caption: 'Attachment Caption',
  },
};

export default function PDFTemplateDocumentation() {
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullScreen
        maxWidth="xl"
      >
        <DialogContent dividers>
          <h1>PDF Template Documentation</h1>
          <div>
            {Object.keys(documentation).map((key) => (
              <Accordion key={key}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography
                    component="h1"
                    color="inherit"
                    variant="h6"
                    noWrap
                  >
                    Object: {key}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography gutterBottom color="inherit" variant="body1">
                    <div key={key}>
                      {Object.keys(documentation[key]).map((subKey) => (
                        <div key={subKey}>
                          <h4>
                            {key}.{subKey}
                          </h4>
                          <span>{documentation[key][subKey].toString()}</span>
                        </div>
                      ))}
                    </div>
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} variant="text">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Button sx={{ mr: 2 }} onClick={handleClickOpen}>
        Help
      </Button>
    </>
  );
}
