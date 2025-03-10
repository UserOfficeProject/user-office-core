/* eslint-disable @typescript-eslint/no-empty-function */
import { ConsoleLogger, setLogger } from '@user-office-software/duo-logger';

import 'reflect-metadata';
import { CoProposerClaimAuthorization } from '../auth/CoProposerClaimAuthorization';
import { UserAuthorizationMock } from '../auth/mockups/UserAuthorization';
import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { RoleClaimAuthorization } from '../auth/RoleClaimAuthorization';
import { VisitRegistrationAuthorization } from '../auth/VisitRegistrationAuthorization';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import { CallDataSourceMock } from '../datasources/mockups/CallDataSource';
import { CoProposerClaimDataSourceMock } from '../datasources/mockups/CoProposerClaimDataSource';
import { EventLogsDataSourceMock } from '../datasources/mockups/EventLogsDataSource';
import { FapDataSourceMock } from '../datasources/mockups/FapDataSource';
import { FeedbackDataSourceMock } from '../datasources/mockups/FeedbackDataSource';
import FileDataSourceMock from '../datasources/mockups/FileDataSource';
import { GenericTemplateDataSourceMock } from '../datasources/mockups/GenericTemplateDataSource';
import { InstrumentDataSourceMock } from '../datasources/mockups/InstrumentDataSource';
import { InternalReviewDataSourceMock } from '../datasources/mockups/InternalReviewDataSource';
import { InviteDataSourceMock } from '../datasources/mockups/InviteDataSource';
import { PdfTemplateDataSourceMock } from '../datasources/mockups/PdfTemplateDataSource';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { ProposalEsiDataSourceMock } from '../datasources/mockups/ProposalEsiDataSource';
import { PostgresProposalInternalCommentsDataSourceMock } from '../datasources/mockups/ProposalInternalCommentsDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { RedeemDataSourceMock } from '../datasources/mockups/RedeemDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { RoleClaimDataSourceMock } from '../datasources/mockups/RoleClaimDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import ScheduledEventDataSourceMock from '../datasources/mockups/ScheduledEventDataSource';
import { ShipmentDataSourceMock } from '../datasources/mockups/ShipmentDataSource';
import { StatusActionsDataSourceMock } from '../datasources/mockups/StatusActionsDataSource';
import { StatusActionsLogsDataSourceMock } from '../datasources/mockups/StatusActionsLogsDataSource';
import { StatusDataSourceMock } from '../datasources/mockups/StatusDataSource';
import SystemDataSourceMock from '../datasources/mockups/SystemDataSource';
import { TechniqueDataSourceMock } from '../datasources/mockups/TechniqueDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import { UnitDataSourceMock } from '../datasources/mockups/UnitDataSource';
import { UserDataSourceMock } from '../datasources/mockups/UserDataSource';
import { WorkflowDataSourceMock } from '../datasources/mockups/WorkflowDataSource';
import PostgresPredefinedMessageDataSource from '../datasources/postgres/PredefinedMessageDataSource';
import { essEmailHandler } from '../eventHandlers/email/essEmailHandler';
import { SkipSendMailService } from '../eventHandlers/MailService/SkipSendMailService';
import {
  createSkipListeningHandler,
  createSkipPostingHandler,
} from '../eventHandlers/messageBroker';
import { EventBus } from '../events/eventBus';
import { DefaultDownloadService } from '../factory/DefaultDownloadService';
import BasicUserDetailsLoader from '../loaders/BasicUserDetailsLoader';
import { SkipAssetRegistrar } from '../services/assetRegistrar/skip/SkipAssetRegistrar';
import { SampleEsiDataSourceMock } from './../datasources/mockups/SampleEsiDataSource';
import { VisitDataSourceMock } from './../datasources/mockups/VisitDataSource';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

mapClass(Tokens.AdminDataSource, AdminDataSourceMock);
mapClass(Tokens.CoProposerClaimDataSource, CoProposerClaimDataSourceMock);
mapClass(Tokens.CallDataSource, CallDataSourceMock);
mapClass(Tokens.EventLogsDataSource, EventLogsDataSourceMock);
mapClass(Tokens.FeedbackDataSource, FeedbackDataSourceMock);
mapClass(Tokens.FileDataSource, FileDataSourceMock);
mapClass(Tokens.GenericTemplateDataSource, GenericTemplateDataSourceMock);
mapClass(Tokens.InstrumentDataSource, InstrumentDataSourceMock);
mapClass(Tokens.InviteDataSource, InviteDataSourceMock);
mapClass(Tokens.RoleClaimDataSource, RoleClaimDataSourceMock);
mapClass(Tokens.RoleClaimAuthorization, RoleClaimAuthorization);
mapClass(Tokens.CoProposerClaimAuthorization, CoProposerClaimAuthorization);
mapClass(Tokens.InternalReviewDataSource, InternalReviewDataSourceMock);
mapClass(Tokens.PdfTemplateDataSource, PdfTemplateDataSourceMock);
mapClass(Tokens.ProposalDataSource, ProposalDataSourceMock);
mapClass(Tokens.ProposalEsiDataSource, ProposalEsiDataSourceMock);
mapClass(
  Tokens.ProposalInternalCommentsDataSource,
  PostgresProposalInternalCommentsDataSourceMock
);
mapClass(Tokens.WorkflowDataSource, WorkflowDataSourceMock);
mapClass(Tokens.StatusDataSource, StatusDataSourceMock);
mapClass(Tokens.StatusActionsDataSource, StatusActionsDataSourceMock);
mapClass(Tokens.QuestionaryDataSource, QuestionaryDataSourceMock);
mapClass(Tokens.RedeemCodesDataSource, RedeemDataSourceMock);
mapClass(Tokens.ReviewDataSource, ReviewDataSourceMock);
mapClass(Tokens.FapDataSource, FapDataSourceMock);
mapClass(Tokens.SampleDataSource, SampleDataSourceMock);
mapClass(Tokens.SampleEsiDataSource, SampleEsiDataSourceMock);
mapClass(Tokens.ScheduledEventDataSource, ScheduledEventDataSourceMock);
mapClass(Tokens.ShipmentDataSource, ShipmentDataSourceMock);
mapClass(Tokens.SystemDataSource, SystemDataSourceMock);
mapClass(Tokens.TechniqueDataSource, TechniqueDataSourceMock);
mapClass(Tokens.TemplateDataSource, TemplateDataSourceMock);
mapClass(Tokens.UnitDataSource, UnitDataSourceMock);
mapClass(Tokens.UserDataSource, UserDataSourceMock);
mapClass(Tokens.VisitDataSource, VisitDataSourceMock);
mapClass(Tokens.VisitRegistrationAuthorization, VisitRegistrationAuthorization);
mapClass(
  Tokens.PredefinedMessageDataSource,
  PostgresPredefinedMessageDataSource
);
mapClass(Tokens.StatusActionsLogsDataSource, StatusActionsLogsDataSourceMock);

mapClass(Tokens.UserAuthorization, UserAuthorizationMock);
mapClass(Tokens.ProposalAuthorization, ProposalAuthorization);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapValue(Tokens.PostToMessageQueue, createSkipPostingHandler());
mapValue(Tokens.EventBus, jest.mocked(new EventBus()));
mapValue(Tokens.ListenToMessageQueue, createSkipListeningHandler());

mapClass(Tokens.MailService, SkipSendMailService);

mapValue(Tokens.EmailEventHandler, essEmailHandler);

mapValue(Tokens.ConfigureEnvironment, () => {});
mapValue(Tokens.ConfigureLogger, () =>
  setLogger(new ConsoleLogger({ colorize: true }))
);

mapClass(Tokens.DownloadService, DefaultDownloadService);

mapClass(Tokens.BasicUserDetailsLoader, BasicUserDetailsLoader);

jest.mock('../decorators/EventBus', () => {
  return () => jest.fn();
});
