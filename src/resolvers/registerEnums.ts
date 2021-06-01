import { registerEnumType } from 'type-graphql';

import { Event } from '../events/event.enum';
import {
  DependenciesLogicOperator,
  EvaluatorOperator,
} from '../models/ConditionEvaluator';
import { FeatureId } from '../models/Feature';
import { PageName } from '../models/Page';
import { ProposalEndStatus, ProposalPublicStatus } from '../models/Proposal';
import { QuestionFilterCompareOperator } from '../models/Questionary';
import { ReviewerFilter, ReviewStatus } from '../models/Review';
import { SampleStatus } from '../models/Sample';
import { SettingsId } from '../models/Settings';
import { ShipmentStatus } from '../models/Shipment';
import { TechnicalReviewStatus } from '../models/TechnicalReview';
import { DataType, TemplateCategoryId } from '../models/Template';
import { UserRole } from '../models/User';
import { VisitationStatus } from '../models/Visitation';
import { NumberValueConstraint } from './types/FieldConfig';

export const registerEnums = () => {
  registerEnumType(TemplateCategoryId, { name: 'TemplateCategoryId' });
  registerEnumType(ProposalEndStatus, { name: 'ProposalEndStatus' });
  registerEnumType(ProposalPublicStatus, { name: 'ProposalPublicStatus' });
  registerEnumType(ReviewStatus, { name: 'ReviewStatus' });
  registerEnumType(ReviewerFilter, { name: 'ReviewerFilter' });
  registerEnumType(TechnicalReviewStatus, { name: 'TechnicalReviewStatus' });
  registerEnumType(PageName, { name: 'PageName' });
  registerEnumType(UserRole, { name: 'UserRole' });
  registerEnumType(EvaluatorOperator, { name: 'EvaluatorOperator' });
  registerEnumType(DataType, { name: 'DataType' });
  registerEnumType(SampleStatus, { name: 'SampleStatus' });
  registerEnumType(Event, { name: 'Event' });
  registerEnumType(ShipmentStatus, { name: 'ShipmentStatus' });
  registerEnumType(DependenciesLogicOperator, {
    name: 'DependenciesLogicOperator',
  });
  registerEnumType(FeatureId, { name: 'FeatureId' });
  registerEnumType(SettingsId, { name: 'SettingsId' });
  registerEnumType(NumberValueConstraint, { name: 'NumberValueConstraint' });
  registerEnumType(QuestionFilterCompareOperator, {
    name: 'QuestionFilterCompareOperator',
  });
  registerEnumType(VisitationStatus, {
    name: 'VisitationStatus',
  });
};
