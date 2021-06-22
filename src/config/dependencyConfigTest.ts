import 'reflect-metadata';
import { container } from 'tsyringe';

import { AdminDataSource } from '../datasources/AdminDataSource';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import { CallDataSourceMock } from '../datasources/mockups/CallDataSource';
import { EventLogsDataSourceMock } from '../datasources/mockups/EventLogsDataSource';
import FileDataSourceMock from '../datasources/mockups/FileDataSource';
import { InstrumentDataSourceMock } from '../datasources/mockups/InstrumentDataSource';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { ProposalSettingsDataSourceMock } from '../datasources/mockups/ProposalSettingsDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import { ShipmentDataSourceMock } from '../datasources/mockups/ShipmentDataSource';
import SystemDataSourceMock from '../datasources/mockups/SystemDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import { UserDataSourceMock } from '../datasources/mockups/UserDataSource';
import { SkipSendMailService } from '../eventHandlers/MailService/SkipSendMailService';
import { createSkipPostingHandler } from '../eventHandlers/messageBroker';
import { FeatureId } from '../models/Feature';
import { SkipAssetRegistrar } from '../utils/EAM_service';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';
import { UserAuthorization } from '../utils/UserAuthorization';
import { VisitAuthorization } from '../utils/VisitAuthorization';
import { VisitDataSourceMock } from './../datasources/mockups/VisitDataSource';
import { Tokens } from './Tokens';
import { mapClass, mapValue } from './utils';

mapClass(Tokens.UserAuthorization, UserAuthorization);
mapClass(Tokens.QuestionaryAuthorization, QuestionaryAuthorization);
mapClass(Tokens.SampleAuthorization, SampleAuthorization);
mapClass(Tokens.ShipmentAuthorization, ShipmentAuthorization);
mapClass(Tokens.VisitAuthorization, VisitAuthorization);

mapClass(Tokens.AdminDataSource, AdminDataSourceMock);
mapClass(Tokens.CallDataSource, CallDataSourceMock);
mapClass(Tokens.EventLogsDataSource, EventLogsDataSourceMock);
mapClass(Tokens.InstrumentDataSource, InstrumentDataSourceMock);
mapClass(Tokens.ProposalDataSource, ProposalDataSourceMock);
mapClass(Tokens.ProposalSettingsDataSource, ProposalSettingsDataSourceMock);
mapClass(Tokens.QuestionaryDataSource, QuestionaryDataSourceMock);
mapClass(Tokens.ReviewDataSource, ReviewDataSourceMock);
mapClass(Tokens.SampleDataSource, SampleDataSourceMock);
mapClass(Tokens.SEPDataSource, SEPDataSourceMock);
mapClass(Tokens.ShipmentDataSource, ShipmentDataSourceMock);
mapClass(Tokens.SystemDataSource, SystemDataSourceMock);
mapClass(Tokens.TemplateDataSource, TemplateDataSourceMock);
mapClass(Tokens.UserDataSource, UserDataSourceMock);
mapClass(Tokens.FileDataSource, FileDataSourceMock);
mapClass(Tokens.VisitDataSource, VisitDataSourceMock);

mapClass(Tokens.AssetRegistrar, SkipAssetRegistrar);

mapValue(Tokens.PostToMessageQueue, createSkipPostingHandler());

mapClass(Tokens.MailService, SkipSendMailService);

mapValue(Tokens.EnableDefaultFeatures, () => {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.setFeatures([FeatureId.SCHEDULER, FeatureId.SHIPPING], true);
});
