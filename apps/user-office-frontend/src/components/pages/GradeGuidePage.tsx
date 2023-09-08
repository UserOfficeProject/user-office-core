import MenuBookIcon from '@mui/icons-material/MenuBook';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import parse from 'html-react-parser';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { PageName, Sep } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { StyledContainer } from 'styles/StyledComponents';

type GradeGuidePageProps = {
  sep?: Sep;
};

const GradeGuidePage = ({ sep }: GradeGuidePageProps) => {
  const [loadingPage, pageContent] = useGetPageContent(PageName.GRADEGUIDEPAGE);

  const noContents = (
    <Stack alignItems="center">
      <MenuBookIcon
        sx={(theme) => ({
          width: '100px',
          height: '100px',
          color: theme.palette.grey[300],
          margin: '20px 200px',
        })}
      />
      <Typography>No guide has been added yet</Typography>
    </Stack>
  );

  if (loadingPage) {
    return (
      <Box textAlign="center">
        <UOLoader />
      </Box>
    );
  }

  const content = sep?.customGradeGuide
    ? sep?.gradeGuide
      ? parse(sep.gradeGuide)
      : noContents
    : pageContent
    ? parse(pageContent)
    : noContents;

  return <StyledContainer>{content}</StyledContainer>;
};

export default GradeGuidePage;
