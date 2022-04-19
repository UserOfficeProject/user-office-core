import { QueryParamConfig } from 'use-query-params';

import { UrlQueryParamsType } from 'components/common/SuperMaterialTable';

export type ExperimentUrlQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  instrument: QueryParamConfig<number | null | undefined>;
  from: QueryParamConfig<Date | null | undefined>;
  to: QueryParamConfig<Date | null | undefined>;
} & UrlQueryParamsType;
