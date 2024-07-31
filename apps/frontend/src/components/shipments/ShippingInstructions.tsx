import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import CopyToClipboard from 'components/common/CopyToClipboard';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';

const steps = [
  {
    label: 'Declare the shipment',
    description: (
      <ul>
        <li>Click &quot;Add shipment declaration&quot; on the right side;</li>
        <li>If you have multiple parcels, add one declaration per parcel;</li>
        <li>Fill out the form;</li>
        <li>
          Download the label at the last step (label is used to identify the
          package when it arrives at ESS).
        </li>
      </ul>
    ),
  },
  {
    label: 'Prepare the parcel',
    description: (
      <ul>
        <li>Print and cut the label;</li>
        <li>Place the label inside a plastic wallet for extra protection;</li>
        <li>Stick the label to both sides of the parcel;</li>
        <li>If using tape not tape over the barcodes.</li>
      </ul>
    ),
  },
  {
    label: 'Ship',
    description: (
      <ul>
        <li>
          Choose courier that provides the tracking code for your parcel DHL,
          TNT, Fedex, UPS or similar. Follow the instructions given by your
          courier;
        </li>
        <li>
          Use this address for shipping
          <CopyToClipboard
            text={`European Spallation Source ERIC
              Transportgatan 5 – GATE E F03
              224 84 Lund`}
          >
            <Box sx={BOLD_TEXT_STYLE}>
              European Spallation Source ERIC <br />
              Transportgatan 5 – GATE E F03 <br />
              224 84 Lund
            </Box>
          </CopyToClipboard>
        </li>
      </ul>
    ),
  },
];

export default function ShippingInstructions() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === 2 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="text"
                  disabled={index === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="text"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {index === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>
            You might want to inform your local contact to expect parcel!
          </Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Read again
          </Button>
        </Paper>
      )}
    </Box>
  );
}
