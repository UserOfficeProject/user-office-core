import {
  ConsoleLogger,
  logger,
  setLogger,
} from '@user-office-software/duo-logger';

import 'reflect-metadata';
import { OAuthAuthorization } from '../auth/OAuthAuthorization';
import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { VisitRegistrationAuthorization } from '../auth/VisitRegistrationAuthorization';
import { PostgresAdminDataSourceWithAutoUpgrade } from '../datasources/postgres/AdminDataSource';
import PostgresCallDataSource from '../datasources/postgres/CallDataSource';
import PostgresCoProposerClaimDataSource from '../datasources/postgres/CoProposerClaimDataSource';
import PostgresEventLogsDataSource from '../datasources/postgres/EventLogsDataSource';
import PostgresExperimentDataSource from '../datasources/postgres/ExperimentDataSource';
import PostgresFapDataSource from '../datasources/postgres/FapDataSource';
import PostgresFeedbackDataSource from '../datasources/postgres/FeedbackDataSource';
import PostgresFileDataSource from '../datasources/postgres/FileDataSource';
import PostgresGenericTemplateDataSource from '../datasources/postgres/GenericTemplateDataSource';
import PostgresInstrumentDataSource from '../datasources/postgres/InstrumentDataSource';
import PostgresInternalReviewDataSource from '../datasources/postgres/InternalReviewDataSource';
import PostgresInviteDataSource from '../datasources/postgres/InviteDataSource';
import PostgresPdfTemplateDataSource from '../datasources/postgres/PdfTemplateDataSource';
import PostgresPredefinedMessageDataSource from '../datasources/postgres/PredefinedMessageDataSource';
import PostgresProposalDataSource from '../datasources/postgres/ProposalDataSource';
import PostgresProposalInternalCommentsDataSource from '../datasources/postgres/ProposalInternalCommentsDataSource';
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
import PostgresTechniqueDataSource from '../datasources/postgres/TechniqueDataSource';
import PostgresTemplateDataSource from '../datasources/postgres/TemplateDataSource';
import PostgresUnitDataSource from '../datasources/postgres/UnitDataSource';
import PostgresUserDataSource from '../datasources/postgres/UserDataSource';
import PostgresVisitDataSource from '../datasources/postgres/VisitDataSource';
import PostgresWorkflowDataSource from '../datasources/postgres/WorkflowDataSource';
import { createSkipLoggingHandler } from '../eventHandlers/logging';
import { SkipSendMailService } from '../eventHandlers/MailService/SkipSendMailService';
import {
  createSkipListeningHandler,
  createSkipPostingHandler,
} from '../eventHandlers/messageBroker';
import { createApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { DefaultDownloadService } from '../factory/DefaultDownloadService';
import { FapDataColumns } from '../factory/xlsx/FapDataColumns';
import {
  callFapPopulateRow,
  getDataRow,
  populateRow,
} from '../factory/xlsx/FapDataRow';
import BasicUserDetailsLoader from '../loaders/BasicUserDetailsLoader';
import { SkipAssetRegistrar } from '../services/assetRegistrar/skip/SkipAssetRegistrar';
import { configureBaseEnvironment } from './base/configureBaseEnvironment';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

async function skipEmailHandler(event: ApplicationEvent) {
  logger.logInfo('Skip email sending', { event });
}

mapClass(Tokens.AdminDataSource, PostgresAdminDataSourceWithAutoUpgrade);
mapClass(Tokens.CoProposerClaimDataSource, PostgresCoProposerClaimDataSource);
mapClass(Tokens.CallDataSource, PostgresCallDataSource);
mapClass(Tokens.EventLogsDataSource, PostgresEventLogsDataSource);
mapClass(Tokens.FeedbackDataSource, PostgresFeedbackDataSource);
mapClass(Tokens.FileDataSource, PostgresFileDataSource);
mapClass(Tokens.GenericTemplateDataSource, PostgresGenericTemplateDataSource);
mapClass(Tokens.InstrumentDataSource, PostgresInstrumentDataSource);
mapClass(Tokens.InviteDataSource, PostgresInviteDataSource);
mapClass(Tokens.RoleClaimDataSource, PostgresRoleClaimDataSource);
mapClass(Tokens.InternalReviewDataSource, PostgresInternalReviewDataSource);
mapClass(Tokens.PdfTemplateDataSource, PostgresPdfTemplateDataSource);
mapClass(Tokens.ProposalDataSource, PostgresProposalDataSource);
mapClass(
  Tokens.ProposalInternalCommentsDataSource,
  PostgresProposalInternalCommentsDataSource
);
mapClass(Tokens.StatusActionsDataSource, PostgresStatusActionsDataSource);
mapClass(Tokens.QuestionaryDataSource, PostgresQuestionaryDataSource);
mapClass(Tokens.RedeemCodesDataSource, PostgresRedeemCodesDataSource);
mapClass(Tokens.ReviewDataSource, PostgresReviewDataSource);
mapClass(Tokens.FapDataSource, PostgresFapDataSource);
mapClass(Tokens.SampleDataSource, PostgresSampleDataSource);
mapClass(Tokens.ShipmentDataSource, PostgresShipmentDataSource);
mapClass(Tokens.SystemDataSource, PostgresSystemDataSource);
mapClass(Tokens.TemplateDataSource, PostgresTemplateDataSource);
mapClass(Tokens.UnitDataSource, PostgresUnitDataSource);
mapClass(Tokens.UserDataSource, PostgresUserDataSource);
mapClass(Tokens.VisitDataSource, PostgresVisitDataSource);
mapClass(Tokens.VisitRegistrationAuthorization, VisitRegistrationAuthorization);
mapClass(Tokens.TechniqueDataSource, PostgresTechniqueDataSource);
mapClass(
  Tokens.PredefinedMessageDataSource,
  PostgresPredefinedMessageDataSource
);
mapClass(Tokens.StatusActionsLogsDataSource, StatusActionsLogsDataSource);
mapClass(Tokens.WorkflowDataSource, PostgresWorkflowDataSource);
mapClass(Tokens.StatusDataSource, PostgresStatusDataSource);
mapClass(Tokens.ExperimentDataSource, PostgresExperimentDataSource);
mapClass(Tokens.UserAuthorization, OAuthAuthorization);
mapClass(Tokens.ProposalAuthorization, ProposalAuthorization);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapClass(Tokens.MailService, SkipSendMailService);

mapValue(Tokens.FapDataColumns, FapDataColumns);
mapValue(Tokens.FapDataRow, getDataRow);
mapValue(Tokens.PopulateRow, populateRow);
mapValue(Tokens.PopulateCallRow, callFapPopulateRow);

mapValue(Tokens.EmailEventHandler, skipEmailHandler);

mapValue(Tokens.PostToMessageQueue, createSkipPostingHandler());
mapValue(Tokens.LoggingHandler, createSkipLoggingHandler());
mapValue(Tokens.EventBus, createApplicationEventBus());
mapValue(Tokens.ListenToMessageQueue, createSkipListeningHandler());

mapValue(Tokens.ConfigureEnvironment, configureBaseEnvironment);
mapValue(Tokens.ConfigureLogger, () => setLogger(new ConsoleLogger()));

mapClass(Tokens.DownloadService, DefaultDownloadService);

mapClass(Tokens.BasicUserDetailsLoader, BasicUserDetailsLoader);
