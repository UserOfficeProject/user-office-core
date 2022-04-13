import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Stack, Typography } from '@mui/material';
import parse from 'html-react-parser';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { StyledContainer } from 'styles/StyledComponents';

const GradeGuidePage: React.FC = () => {
  const [loadingPage, pageContent] = useGetPageContent(PageName.GRADEGUIDEPAGE);

  const noContents = (
    <Stack alignItems={'center'}>
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
    return <UOLoader />;
  }
  const content = pageContent ? parse(pageContent) : noContents;

  return <StyledContainer>{content}</StyledContainer>;
};

export default GradeGuidePage;
