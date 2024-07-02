import { QueryParamConfig } from 'use-query-params';

import { UrlQueryParamsType } from 'components/common/SuperMaterialTable';

export type ExperimentUrlQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  instrument: QueryParamConfig<number | null | undefined>;
  from: QueryParamConfig<string | null | undefined>;
  to: QueryParamConfig<string | null | undefined>;
} & UrlQueryParamsType;
