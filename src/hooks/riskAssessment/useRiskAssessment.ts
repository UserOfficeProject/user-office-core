import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import { RiskAssessment } from './../../generated/sdk';

export function useRiskAssessment(riskAssessmentId: number) {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let cancelled = false;

    if (riskAssessmentId) {
      setLoading(true);
      api()
        .getRiskAssessment({ riskAssessmentId })
        .then((data) => {
          if (cancelled) {
            return;
          }

          setRiskAssessment(data.riskAssessment as RiskAssessment);
          setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [riskAssessmentId, api]);

  return { loading, riskAssessment, setRiskAssessment };
}
