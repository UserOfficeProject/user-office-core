import {
  QuestionFilterCompareOperator,
  QuestionTemplateRelationFragment,
} from 'generated/sdk';

import { SearchCriteria } from '../common/proposalFilters/QuestionaryFilter';

export interface SearchCriteriaInputProps {
  searchCriteria: SearchCriteria | null;
  onChange: (
    comparator: QuestionFilterCompareOperator,
    value: string | number | boolean | any[]
  ) => any;
  questionTemplateRelation: QuestionTemplateRelationFragment;
}
