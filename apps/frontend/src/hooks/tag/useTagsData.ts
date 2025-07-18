import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { InstrumentMinimalFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type TagData = {
  id: number;
  name: string;
  shortCode: string;
  instruments: InstrumentMinimalFragment[];
  calls: { id: number; shortCode: string }[];
};

export function useTagsData(): {
  loadingTags: boolean;
  tags: TagData[];
  setTagsWithLoading: Dispatch<SetStateAction<TagData[]>>;
} {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  const api = useDataApi();

  const setTagsWithLoading = (data: SetStateAction<TagData[]>) => {
    setLoadingTags(true);
    setTags(data);
    setLoadingTags(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingTags(true);

    api()
      .getTags()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data) {
          setTags(data.tags);
        }
        setLoadingTags(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api]);

  return {
    loadingTags: loadingTags,
    tags,
    setTagsWithLoading: setTagsWithLoading,
  };
}
