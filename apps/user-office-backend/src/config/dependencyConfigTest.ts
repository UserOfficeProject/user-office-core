/* eslint-disable @typescript-eslint/no-empty-function */
import { setLogger, ConsoleLogger } from '@user-office-software/duo-logger';

import { UserAuthorizationMock } from '../auth/mockups/UserAuthorization';
import 'reflect-metadata';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import { CallDataSourceMock } from '../datasources/mockups/CallDataSource';
import { EventLogsDataSourceMock } from '../datasources/mockups/EventLogsDataSource';
import { FeedbackDataSourceMock } from '../datasources/mockups/FeedbackDataSource';
import FileDataSourceMock from '../datasources/mockups/FileDataSource';
import { GenericTemplateDataSourceMock } from '../datasources/mockups/GenericTemplateDataSource';
import { InstrumentDataSourceMock } from '../datasources/mockups/InstrumentDataSource';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { ProposalEsiDataSourceMock } from '../datasources/mockups/ProposalEsiDataSource';
import { ProposalSettingsDataSourceMock } from '../datasources/mockups/ProposalSettingsDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import ScheduledEventDataSourceMock from '../datasources/mockups/ScheduledEventDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import { ShipmentDataSourceMock } from '../datasources/mockups/ShipmentDataSource';
import SystemDataSourceMock from '../datasources/mockups/SystemDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import { UnitDataSourceMock } from '../datasources/mockups/UnitDataSource';
import { UserDataSourceMock } from '../datasources/mockups/UserDataSource';
import { essEmailHandler } from '../eventHandlers/email/essEmailHandler';
import { SkipSendMailService } from '../eventHandlers/MailService/SkipSendMailService';
import {
  createSkipListeningHandler,
  createSkipPostingHandler,
} from '../eventHandlers/messageBroker';
import { SkipAssetRegistrar } from '../services/assetRegistrar/skip/SkipAssetRegistrar';
import { SampleEsiDataSourceMock } from './../datasources/mockups/SampleEsiDataSource';
import { VisitDataSourceMock } from './../datasources/mockups/VisitDataSource';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

mapClass(Tokens.AdminDataSource, AdminDataSourceMock);
mapClass(Tokens.CallDataSource, CallDataSourceMock);
mapClass(Tokens.EventLogsDataSource, EventLogsDataSourceMock);
mapClass(Tokens.FeedbackDataSource, FeedbackDataSourceMock);
mapClass(Tokens.FileDataSource, FileDataSourceMock);
mapClass(Tokens.GenericTemplateDataSource, GenericTemplateDataSourceMock);
mapClass(Tokens.InstrumentDataSource, InstrumentDataSourceMock);
mapClass(Tokens.ProposalDataSource, ProposalDataSourceMock);
mapClass(Tokens.ProposalEsiDataSource, ProposalEsiDataSourceMock);
mapClass(Tokens.ProposalSettingsDataSource, ProposalSettingsDataSourceMock);
mapClass(Tokens.QuestionaryDataSource, QuestionaryDataSourceMock);
mapClass(Tokens.ReviewDataSource, ReviewDataSourceMock);
mapClass(Tokens.SEPDataSource, SEPDataSourceMock);
mapClass(Tokens.SampleDataSource, SampleDataSourceMock);
mapClass(Tokens.SampleEsiDataSource, SampleEsiDataSourceMock);
mapClass(Tokens.ScheduledEventDataSource, ScheduledEventDataSourceMock);
mapClass(Tokens.ShipmentDataSource, ShipmentDataSourceMock);
mapClass(Tokens.SystemDataSource, SystemDataSourceMock);
mapClass(Tokens.TemplateDataSource, TemplateDataSourceMock);
mapClass(Tokens.UnitDataSource, UnitDataSourceMock);
mapClass(Tokens.UserDataSource, UserDataSourceMock);
mapClass(Tokens.VisitDataSource, VisitDataSourceMock);

mapClass(Tokens.UserAuthorization, UserAuthorizationMock);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapValue(Tokens.PostToMessageQueue, createSkipPostingHandler());
mapValue(Tokens.ListenToMessageQueue, createSkipListeningHandler());

mapClass(Tokens.MailService, SkipSendMailService);

mapValue(Tokens.EmailEventHandler, essEmailHandler);

mapValue(Tokens.ConfigureEnvironment, () => {});
mapValue(Tokens.ConfigureLogger, () => setLogger(new ConsoleLogger()));
