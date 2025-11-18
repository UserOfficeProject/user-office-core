import 'reflect-metadata';

import { DataAccessUsersAuthorization } from '../auth/DataAccessUsersAuthorization';
import { StfcProposalAuthorization } from '../auth/StfcProposalAuthorization';
import { StfcUserAuthorization } from '../auth/StfcUserAuthorization';
import { VisitAuthorization } from '../auth/VisitAuthorization';
import { VisitRegistrationAuthorization } from '../auth/VisitRegistrationAuthorization';
import { PostgresAdminDataSourceWithAutoUpgrade } from '../datasources/postgres/AdminDataSource';
import PostgresCallDataSource from '../datasources/postgres/CallDataSource';
import PostgresCoProposerClaimDataSource from '../datasources/postgres/CoProposerClaimDataSource';
import PostgresDataAccessUsersDataSource from '../datasources/postgres/DataAccessUsersDataSource';
import PostgresEmailTemplateDataSource from '../datasources/postgres/EmailTemplateDataSource';
import PostgresEventLogsDataSource from '../datasources/postgres/EventLogsDataSource';
import PostgresExperimentDataSource from '../datasources/postgres/ExperimentDataSource';
import PostgresExperimentSafetyPdfTemplateDataSource from '../datasources/postgres/ExperimentSafetyPdfTemplateDataSource';
import PostgresFeedbackDataSource from '../datasources/postgres/FeedbackDataSource';
import PostgresFileDataSource from '../datasources/postgres/FileDataSource';
import PostgresGenericTemplateDataSource from '../datasources/postgres/GenericTemplateDataSource';
import PostgresInviteDataSource from '../datasources/postgres/InviteDataSource';
import PostgresPredefinedMessageDataSource from '../datasources/postgres/PredefinedMessageDataSource';
import PostgresProposalInternalCommentsDataSource from '../datasources/postgres/ProposalInternalCommentsDataSource';
import PostgresProposalPdfTemplateDataSource from '../datasources/postgres/ProposalPdfTemplateDataSource';
import PostgresQuestionaryDataSource from '../datasources/postgres/QuestionaryDataSource';
import PostgresRedeemCodesDataSource from '../datasources/postgres/RedeemCodesDataSource';
import PostgresReviewDataSource from '../datasources/postgres/ReviewDataSource';
import PostgresRoleClaimDataSource from '../datasources/postgres/RoleClaimsDataSource';
import PostgresSampleDataSource from '../datasources/postgres/SampleDataSource';
import PostgresShipmentDataSource from '../datasources/postgres/ShipmentDataSource';
import PostgresStatusActionsDataSource from '../datasources/postgres/StatusActionsDataSource';
import StatusActionsLogsDataSource from '../datasources/postgres/StatusActionsLogsDataSource';
import PostgresStatusDataSource from '../datasources/postgres/StatusDataSource';
import PostgresSystemDataSource from '../datasources/postgres/SystemDataSource';
import PostgresTagDataSource from '../datasources/postgres/TagDataSource';
import PostgresTemplateDataSource from '../datasources/postgres/TemplateDataSource';
import PostgresUnitDataSource from '../datasources/postgres/UnitDataSource';
import PostgresVisitDataSource from '../datasources/postgres/VisitDataSource';
import PostgresVisitRegistrationClaimDataSource from '../datasources/postgres/VisitRegistrationClaimDataSource';
import PostgresWorkflowDataSource from '../datasources/postgres/WorkflowDataSource';
import StfcFapDataSource from '../datasources/stfc/StfcFapDataSource';
import StfcInstrumentDataSource from '../datasources/stfc/StfcInstrumentDataSource';
import StfcInternalReviewDataSource from '../datasources/stfc/StfcInternalReviewDataSource';
import StfcProposalDataSource from '../datasources/stfc/StfcProposalDataSource';
import StfcTechniqueDataSource from '../datasources/stfc/StfcTechniqueDataSource';
import { StfcUserDataSource } from '../datasources/stfc/StfcUserDataSource';
import { stfcEmailHandler } from '../eventHandlers/email/stfcEmailHandler';
import createLoggingHandler from '../eventHandlers/logging';
import { SMTPMailService } from '../eventHandlers/MailService/SMTPMailService';
import {
  createPostToRabbitMQHandler,
  createSkipListeningHandler,
} from '../eventHandlers/messageBroker';
import { createApplicationEventBus } from '../events';
import { StfcFapDataColumns } from '../factory/xlsx/stfc/StfcFapDataColumns';
import {
  callFapStfcPopulateRow,
  getStfcDataRow,
  populateStfcRow,
} from '../factory/xlsx/stfc/StfcFapDataRow';
import BasicUserDetailsLoader from '../loaders/BasicUserDetailsLoader';
import { SkipAssetRegistrar } from '../services/assetRegistrar/skip/SkipAssetRegistrar';
import { configureSTFCEnvironment } from './stfc/configureSTFCEnvironment';
import { configureSTFCWinstonLogger } from './stfc/configureSTFCWinstonLogger';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

mapClass(Tokens.AdminDataSource, PostgresAdminDataSourceWithAutoUpgrade);
mapClass(Tokens.CoProposerClaimDataSource, PostgresCoProposerClaimDataSource);
mapClass(Tokens.DataAccessUsersDataSource, PostgresDataAccessUsersDataSource);
mapClass(Tokens.CallDataSource, PostgresCallDataSource);
mapClass(Tokens.EventLogsDataSource, PostgresEventLogsDataSource);
mapClass(Tokens.FeedbackDataSource, PostgresFeedbackDataSource);
mapClass(Tokens.FileDataSource, PostgresFileDataSource);
mapClass(Tokens.GenericTemplateDataSource, PostgresGenericTemplateDataSource);
mapClass(Tokens.InstrumentDataSource, StfcInstrumentDataSource);
mapClass(Tokens.InviteDataSource, PostgresInviteDataSource);
mapClass(Tokens.RoleClaimDataSource, PostgresRoleClaimDataSource);
mapClass(
  Tokens.ProposalPdfTemplateDataSource,
  PostgresProposalPdfTemplateDataSource
);
mapClass(
  Tokens.ExperimentSafetyPdfTemplateDataSource,
  PostgresExperimentSafetyPdfTemplateDataSource
);
mapClass(Tokens.ProposalDataSource, StfcProposalDataSource);
mapClass(
  Tokens.ProposalInternalCommentsDataSource,
  PostgresProposalInternalCommentsDataSource
);
mapClass(Tokens.StatusActionsDataSource, PostgresStatusActionsDataSource);
mapClass(Tokens.QuestionaryDataSource, PostgresQuestionaryDataSource);
mapClass(Tokens.RedeemCodesDataSource, PostgresRedeemCodesDataSource);
mapClass(Tokens.ReviewDataSource, PostgresReviewDataSource);
mapClass(Tokens.FapDataSource, StfcFapDataSource);
mapClass(Tokens.SampleDataSource, PostgresSampleDataSource);
mapClass(Tokens.ShipmentDataSource, PostgresShipmentDataSource);
mapClass(Tokens.SystemDataSource, PostgresSystemDataSource);
mapClass(Tokens.TemplateDataSource, PostgresTemplateDataSource);
mapClass(Tokens.UnitDataSource, PostgresUnitDataSource);
mapClass(Tokens.UserDataSource, StfcUserDataSource);
mapClass(Tokens.VisitDataSource, PostgresVisitDataSource);
mapClass(
  Tokens.VisitRegistrationClaimDataSource,
  PostgresVisitRegistrationClaimDataSource
);
mapClass(Tokens.VisitAuthorization, VisitAuthorization);
mapClass(Tokens.VisitRegistrationAuthorization, VisitRegistrationAuthorization);
mapClass(Tokens.InternalReviewDataSource, StfcInternalReviewDataSource);
mapClass(Tokens.TechniqueDataSource, StfcTechniqueDataSource);
mapClass(
  Tokens.PredefinedMessageDataSource,
  PostgresPredefinedMessageDataSource
);
mapClass(Tokens.StatusActionsLogsDataSource, StatusActionsLogsDataSource);
mapClass(Tokens.WorkflowDataSource, PostgresWorkflowDataSource);
mapClass(Tokens.StatusDataSource, PostgresStatusDataSource);
mapClass(Tokens.TagDataSource, PostgresTagDataSource);
mapClass(Tokens.EmailTemplateDataSource, PostgresEmailTemplateDataSource);

mapClass(Tokens.ExperimentDataSource, PostgresExperimentDataSource);
mapClass(Tokens.UserAuthorization, StfcUserAuthorization);
mapClass(Tokens.ProposalAuthorization, StfcProposalAuthorization);
mapClass(Tokens.DataAccessUsersAuthorization, DataAccessUsersAuthorization);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapClass(Tokens.MailService, SMTPMailService);

mapValue(Tokens.FapDataColumns, StfcFapDataColumns);
mapValue(Tokens.FapDataRow, getStfcDataRow);
mapValue(Tokens.PopulateRow, populateStfcRow);
mapValue(Tokens.PopulateCallRow, callFapStfcPopulateRow);

mapValue(Tokens.EmailEventHandler, stfcEmailHandler);

mapValue(Tokens.PostToMessageQueue, createPostToRabbitMQHandler());
mapValue(Tokens.LoggingHandler, createLoggingHandler());
mapValue(Tokens.EventBus, createApplicationEventBus());
mapValue(Tokens.ListenToMessageQueue, createSkipListeningHandler());

mapValue(Tokens.ConfigureEnvironment, configureSTFCEnvironment);
mapValue(Tokens.ConfigureLogger, configureSTFCWinstonLogger);

mapClass(Tokens.BasicUserDetailsLoader, BasicUserDetailsLoader);
