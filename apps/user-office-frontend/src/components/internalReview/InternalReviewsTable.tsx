import Typography from '@mui/material/Typography';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { InternalReview, InternalReviewsFilter } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useInternalReviewsData } from 'hooks/review/useInternalReviewData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import { FunctionType } from 'utils/utilTypes';

import CreateUpdateInternalReview from './CreateUpdateInternalReview';

const columns = [
  { title: 'Title', field: 'title' },
  {
    title: 'Reviewer',
    render: (rowData: InternalReview) => getFullUserName(rowData.reviewer),
  },
  { title: 'Created at', field: 'formattedCreatedAt' },
  {
    title: 'Assigned by',
    render: (rowData: InternalReview) =>
      getFullUserName(rowData.assignedByUser),
  },
];

const InternalReviewsTable = (filter: InternalReviewsFilter) => {
  const { api } = useDataApiWithFeedback();
  const {
    loading,
    internalReviews,
    setInternalReviewsWithLoading: setInternalReviews,
  } = useInternalReviewsData(filter);
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const createModal = (
    onUpdate: FunctionType<void, [InternalReview | null]>,
    onCreate: (internalReview: InternalReview | null) => void,
    editInternalReview: InternalReview | null
  ) => (
    <CreateUpdateInternalReview
      internalReview={editInternalReview}
      close={(internalReview: InternalReview | null) =>
        !!editInternalReview
          ? onUpdate(internalReview)
          : onCreate(internalReview)
      }
      technicalReviewId={filter.technicalReviewId}
    />
  );

  const deleteInternalReview = async (id: string | number) => {
    try {
      await api({
        toastSuccessMessage: 'Internal review deleted successfully',
      }).deleteInternalReview({ input: { id: id as number } });

      return true;
    } catch (error) {
      return false;
    }
  };

  const reviewsWithFormattedData = internalReviews.map((review) => ({
    ...review,
    formattedCreatedAt: toFormattedDateTime(review.createdAt),
  }));

  return (
    <div data-cy="internal-reviews-table">
      <SuperMaterialTable
        title={
          <Typography variant="h6" component="h2">
            Internal reviews
          </Typography>
        }
        delete={deleteInternalReview}
        createModal={createModal}
        createModalSize="sm"
        setData={setInternalReviews}
        icons={tableIcons}
        columns={columns}
        data={reviewsWithFormattedData}
        isLoading={loading}
        options={{
          search: false,
          padding: 'dense',
        }}
      />
    </div>
  );
};

export default InternalReviewsTable;
