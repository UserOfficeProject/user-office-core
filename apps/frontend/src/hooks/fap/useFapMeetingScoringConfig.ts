import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

type FapMeetingScoringConfig = {
  nonNumericOptions: string[];
  minGrade: number;
  maxGrade: number;
  decimalPoints: number;
};

export function useFapMeetingScoringConfig(callId: number) {
  const [loading, setLoading] = useState(true);
  const [scoringConfig, setScoringConfig] = useState<FapMeetingScoringConfig>({
    nonNumericOptions: [],
    minGrade: 0,
    maxGrade: 0,
    decimalPoints: 2,
  });
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    if (!callId) {
      return;
    }

    setLoading(true);
    api()
      .getMeetingScoreConfig({ callId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.fapMeetingScoreConfig) {
          setScoringConfig(data.fapMeetingScoreConfig);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, callId]);

  return { loading, scoringConfig, setScoringConfig } as const;
}
