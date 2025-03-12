import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { ExperimentSafetyWithQuestionary } from 'models/questionary/experimentSafety/ExperimentSafetyWithQuestionary';

export function useExperimentSafety(experimentSafetyPk: number) {
  const [experimentSafety, setExperimentSafety] =
    useState<ExperimentSafetyWithQuestionary | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let cancelled = false;

    if (experimentSafetyPk) {
      setLoading(true);
      api()
        .getExperimentSafety({ experimentSafetyPk })
        .then((data) => {
          if (cancelled) {
            return;
          }

          setExperimentSafety(data.experimentSafety);
          setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [experimentSafetyPk, api]);

  return { loading, experimentSafety, setExperimentSafety };
}
