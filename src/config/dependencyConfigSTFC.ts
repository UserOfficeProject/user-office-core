import { setLogger, ConsoleLogger } from '@user-office-software/duo-logger';
import 'reflect-metadata';

import { StfcUserAuthorization } from '../auth/StfcUserAuthorization';
import { PostgresAdminDataSourceWithAutoUpgrade } from '../datasources/postgres/AdminDataSource';
import PostgresCallDataSource from '../datasources/postgres/CallDataSource';
import PostgresEventLogsDataSource from '../datasources/postgres/EventLogsDataSource';
import PostgresFeedbackDataSource from '../datasources/postgres/FeedbackDataSource';
import PostgresFileDataSource from '../datasources/postgres/FileDataSource';
import PostgresGenericTemplateDataSource from '../datasources/postgres/GenericTemplateDataSource';
import PostgresInstrumentDataSource from '../datasources/postgres/InstrumentDataSource';
import PostgresProposalEsiDataSource from '../datasources/postgres/ProposalEsiDataSource';
import PostgresProposalSettingsDataSource from '../datasources/postgres/ProposalSettingsDataSource';
import PostgresQuestionaryDataSource from '../datasources/postgres/QuestionaryDataSource';
import PostgresReviewDataSource from '../datasources/postgres/ReviewDataSource';
import PostgresSampleDataSource from '../datasources/postgres/SampleDataSource';
import PostgresSampleEsiDataSource from '../datasources/postgres/SampleEsiDataSource';
import PostgresScheduledEventDataSource from '../datasources/postgres/ScheduledEventDataSource';
import PostgresSEPDataSource from '../datasources/postgres/SEPDataSource';
import PostgresShipmentDataSource from '../datasources/postgres/ShipmentDataSource';
import PostgresSystemDataSource from '../datasources/postgres/SystemDataSource';
import PostgresTemplateDataSource from '../datasources/postgres/TemplateDataSource';
import PostgresUnitDataSource from '../datasources/postgres/UnitDataSource';
import PostgresVisitDataSource from '../datasources/postgres/VisitDataSource';
import StfcProposalDataSource from '../datasources/stfc/StfcProposalDataSource';
import { StfcUserDataSource } from '../datasources/stfc/StfcUserDataSource';
import { stfcEmailHandler } from '../eventHandlers/email/stfcEmailHandler';
import { SMTPMailService } from '../eventHandlers/MailService/SMTPMailService';
import {
  createListenToRabbitMQHandler,
  createPostToRabbitMQHandler,
} from '../eventHandlers/messageBroker';
import { SkipAssetRegistrar } from '../services/assetRegistrar/skip/SkipAssetRegistrar';
import { configureSTFCEnvironment } from './stfc/configureSTFCEnvironment';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

mapClass(Tokens.AdminDataSource, PostgresAdminDataSourceWithAutoUpgrade);
mapClass(Tokens.CallDataSource, PostgresCallDataSource);
mapClass(Tokens.EventLogsDataSource, PostgresEventLogsDataSource);
mapClass(Tokens.FeedbackDataSource, PostgresFeedbackDataSource);
mapClass(Tokens.FileDataSource, PostgresFileDataSource);
mapClass(Tokens.GenericTemplateDataSource, PostgresGenericTemplateDataSource);
mapClass(Tokens.InstrumentDataSource, PostgresInstrumentDataSource);
mapClass(Tokens.ProposalDataSource, StfcProposalDataSource);
mapClass(Tokens.ProposalEsiDataSource, PostgresProposalEsiDataSource);
mapClass(Tokens.ProposalSettingsDataSource, PostgresProposalSettingsDataSource);
mapClass(Tokens.QuestionaryDataSource, PostgresQuestionaryDataSource);
mapClass(Tokens.ReviewDataSource, PostgresReviewDataSource);
mapClass(Tokens.SEPDataSource, PostgresSEPDataSource);
mapClass(Tokens.SampleDataSource, PostgresSampleDataSource);
mapClass(Tokens.SampleEsiDataSource, PostgresSampleEsiDataSource);
mapClass(Tokens.ScheduledEventDataSource, PostgresScheduledEventDataSource);
mapClass(Tokens.ShipmentDataSource, PostgresShipmentDataSource);
mapClass(Tokens.SystemDataSource, PostgresSystemDataSource);
mapClass(Tokens.TemplateDataSource, PostgresTemplateDataSource);
mapClass(Tokens.UnitDataSource, PostgresUnitDataSource);
mapClass(Tokens.UserDataSource, StfcUserDataSource);
mapClass(Tokens.VisitDataSource, PostgresVisitDataSource);

mapClass(Tokens.UserAuthorization, StfcUserAuthorization);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapClass(Tokens.MailService, SMTPMailService);

mapValue(Tokens.EmailEventHandler, stfcEmailHandler);

mapValue(Tokens.PostToMessageQueue, createPostToRabbitMQHandler());
mapValue(Tokens.ListenToMessageQueue, createListenToRabbitMQHandler());

mapValue(Tokens.ConfigureEnvironment, configureSTFCEnvironment);
mapValue(Tokens.ConfigureLogger, () => setLogger(new ConsoleLogger()));
