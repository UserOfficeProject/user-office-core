import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { ReviewMeetingFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useReviewMeetingsData(callIds?: number[]): {
  loadingReviewMeetings: boolean;
  reviewMeetings: ReviewMeetingFragment[];
  setReviewMeetingsWithLoading: Dispatch<
    SetStateAction<ReviewMeetingFragment[]>
  >;
} {
  const [reviewMeetings, setReviewMeetings] = useState<ReviewMeetingFragment[]>(
    []
  );
  const [loadingReviewMeetings, setLoadingReviewMeetings] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setReviewMeetingsWithLoading = (
    data: SetStateAction<ReviewMeetingFragment[]>
  ) => {
    setLoadingReviewMeetings(true);
    setReviewMeetings(data);
    setLoadingReviewMeetings(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingReviewMeetings(true);

    api()
      .getReviewMeetings()
      .then((data) => {
        if (unmounted) {
          return;
        }
        setReviewMeetings(data.reviewMeetings);
        setLoadingReviewMeetings(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, callIds]);

  return {
    loadingReviewMeetings,
    reviewMeetings,
    setReviewMeetingsWithLoading,
  };
}
