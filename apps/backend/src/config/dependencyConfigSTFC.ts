import { setLogger, ConsoleLogger } from '@user-office-software/duo-logger';
import 'reflect-metadata';

import { InviteAuthorization } from '../auth/InviteAuthorizer';
import { StfcProposalAuthorization } from '../auth/StfcProposalAuthorization';
import { StfcUserAuthorization } from '../auth/StfcUserAuthorization';
import { PostgresAdminDataSourceWithAutoUpgrade } from '../datasources/postgres/AdminDataSource';
import PostgresCallDataSource from '../datasources/postgres/CallDataSource';
import PostgresCoProposerClaimDataSource from '../datasources/postgres/CoProposerClaimDataSource';
import PostgresEventLogsDataSource from '../datasources/postgres/EventLogsDataSource';
import PostgresExperimentDataSource from '../datasources/postgres/ExperimentDataSource';
import PostgresFeedbackDataSource from '../datasources/postgres/FeedbackDataSource';
import PostgresFileDataSource from '../datasources/postgres/FileDataSource';
import PostgresGenericTemplateDataSource from '../datasources/postgres/GenericTemplateDataSource';
import PostgresInternalReviewDataSource from '../datasources/postgres/InternalReviewDataSource';
import PostgresInviteDataSource from '../datasources/postgres/InviteDataSource';
import PostgresPdfTemplateDataSource from '../datasources/postgres/PdfTemplateDataSource';
import PostgresPredefinedMessageDataSource from '../datasources/postgres/PredefinedMessageDataSource';
import PostgresProposalEsiDataSource from '../datasources/postgres/ProposalEsiDataSource';
import PostgresProposalInternalCommentsDataSource from '../datasources/postgres/ProposalInternalCommentsDataSource';
import PostgresQuestionaryDataSource from '../datasources/postgres/QuestionaryDataSource';
import PostgresRedeemCodesDataSource from '../datasources/postgres/RedeemCodesDataSource';
import PostgresReviewDataSource from '../datasources/postgres/ReviewDataSource';
import PostgresRoleClaimDataSource from '../datasources/postgres/RoleClaimsDataSource';
import PostgresSampleDataSource from '../datasources/postgres/SampleDataSource';
import PostgresSampleEsiDataSource from '../datasources/postgres/SampleEsiDataSource';
import PostgresScheduledEventDataSource from '../datasources/postgres/ScheduledEventDataSource';
import PostgresShipmentDataSource from '../datasources/postgres/ShipmentDataSource';
import PostgresStatusActionsDataSource from '../datasources/postgres/StatusActionsDataSource';
import StatusActionsLogsDataSource from '../datasources/postgres/StatusActionsLogsDataSource';
import PostgresStatusDataSource from '../datasources/postgres/StatusDataSource';
import PostgresSystemDataSource from '../datasources/postgres/SystemDataSource';
import PostgresTemplateDataSource from '../datasources/postgres/TemplateDataSource';
import PostgresUnitDataSource from '../datasources/postgres/UnitDataSource';
import PostgresVisitDataSource from '../datasources/postgres/VisitDataSource';
import PostgresWorkflowDataSource from '../datasources/postgres/WorkflowDataSource';
import StfcFapDataSource from '../datasources/stfc/StfcFapDataSource';
import StfcInstrumentDataSource from '../datasources/stfc/StfcInstrumentDataSource';
import StfcProposalDataSource from '../datasources/stfc/StfcProposalDataSource';
import StfcTechniqueDataSource from '../datasources/stfc/StfcTechniqueDataSource';
import { StfcUserDataSource } from '../datasources/stfc/StfcUserDataSource';
import { stfcEmailHandler } from '../eventHandlers/email/stfcEmailHandler';
import { SMTPMailService } from '../eventHandlers/MailService/SMTPMailService';
import {
  createPostToRabbitMQHandler,
  createSkipListeningHandler,
} from '../eventHandlers/messageBroker';
import { createApplicationEventBus } from '../events';
import { StfcDownloadService } from '../factory/StfcDownloadService';
import { StfcFapDataColumns } from '../factory/xlsx/stfc/StfcFapDataColumns';
import {
  callFapStfcPopulateRow,
  getStfcDataRow,
  populateStfcRow,
} from '../factory/xlsx/stfc/StfcFapDataRow';
import BasicUserDetailsLoader from '../loaders/BasicUserDetailsLoader';
import { SkipAssetRegistrar } from '../services/assetRegistrar/skip/SkipAssetRegistrar';
import { configureSTFCEnvironment } from './stfc/configureSTFCEnvironment';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

mapClass(Tokens.AdminDataSource, PostgresAdminDataSourceWithAutoUpgrade);
mapClass(Tokens.CoProposerClaimDataSource, PostgresCoProposerClaimDataSource);
mapClass(Tokens.CallDataSource, PostgresCallDataSource);
mapClass(Tokens.EventLogsDataSource, PostgresEventLogsDataSource);
mapClass(Tokens.FeedbackDataSource, PostgresFeedbackDataSource);
mapClass(Tokens.FileDataSource, PostgresFileDataSource);
mapClass(Tokens.GenericTemplateDataSource, PostgresGenericTemplateDataSource);
mapClass(Tokens.InstrumentDataSource, StfcInstrumentDataSource);
mapClass(Tokens.InviteDataSource, PostgresInviteDataSource);
mapClass(Tokens.RoleClaimDataSource, PostgresRoleClaimDataSource);
mapClass(Tokens.InviteAuthorization, InviteAuthorization);
mapClass(Tokens.PdfTemplateDataSource, PostgresPdfTemplateDataSource);
mapClass(Tokens.ProposalDataSource, StfcProposalDataSource);
mapClass(Tokens.ProposalEsiDataSource, PostgresProposalEsiDataSource);
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
mapClass(Tokens.SampleEsiDataSource, PostgresSampleEsiDataSource);
mapClass(Tokens.ScheduledEventDataSource, PostgresScheduledEventDataSource);
mapClass(Tokens.ShipmentDataSource, PostgresShipmentDataSource);
mapClass(Tokens.SystemDataSource, PostgresSystemDataSource);
mapClass(Tokens.TemplateDataSource, PostgresTemplateDataSource);
mapClass(Tokens.UnitDataSource, PostgresUnitDataSource);
mapClass(Tokens.UserDataSource, StfcUserDataSource);
mapClass(Tokens.VisitDataSource, PostgresVisitDataSource);
mapClass(Tokens.InternalReviewDataSource, PostgresInternalReviewDataSource);
mapClass(Tokens.TechniqueDataSource, StfcTechniqueDataSource);
mapClass(
  Tokens.PredefinedMessageDataSource,
  PostgresPredefinedMessageDataSource
);
mapClass(Tokens.StatusActionsLogsDataSource, StatusActionsLogsDataSource);
mapClass(Tokens.WorkflowDataSource, PostgresWorkflowDataSource);
mapClass(Tokens.StatusDataSource, PostgresStatusDataSource);
mapClass(Tokens.ExperimentDataSource, PostgresExperimentDataSource);
mapClass(Tokens.UserAuthorization, StfcUserAuthorization);
mapClass(Tokens.ProposalAuthorization, StfcProposalAuthorization);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapClass(Tokens.MailService, SMTPMailService);

mapValue(Tokens.FapDataColumns, StfcFapDataColumns);
mapValue(Tokens.FapDataRow, getStfcDataRow);
mapValue(Tokens.PopulateRow, populateStfcRow);
mapValue(Tokens.PopulateCallRow, callFapStfcPopulateRow);

mapValue(Tokens.EmailEventHandler, stfcEmailHandler);

mapValue(Tokens.PostToMessageQueue, createPostToRabbitMQHandler());
mapValue(Tokens.EventBus, createApplicationEventBus());
mapValue(Tokens.ListenToMessageQueue, createSkipListeningHandler());

mapValue(Tokens.ConfigureEnvironment, configureSTFCEnvironment);
mapValue(Tokens.ConfigureLogger, () => setLogger(new ConsoleLogger()));

mapClass(Tokens.DownloadService, StfcDownloadService);

mapClass(Tokens.BasicUserDetailsLoader, BasicUserDetailsLoader);
