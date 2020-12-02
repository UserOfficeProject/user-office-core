import PostgresAdminDataSource from './postgres/AdminDataSource';
import PostgresCallDataSource from './postgres/CallDataSource';
import PostgresEventLogsDataSource from './postgres/EventLogsDataSource';
import PostgresFileDataSource from './postgres/FileDataSource';
import PostgresInstrumentDataSource from './postgres/InstrumentDataSource';
import PostgresProposalDataSource from './postgres/ProposalDataSource';
import PostgresProposalSettingsDataSource from './postgres/ProposalSettingsDataSource';
import PostgresQuestionaryDataSource from './postgres/QuestionaryDataSource';
import PostgresReviewDataSource from './postgres/ReviewDataSource';
import PostgresSampleDataSource from './postgres/SampleDataSource';
import PostgresSEPDataSource from './postgres/SEPDataSource';
import PostgresTemplateDataSource from './postgres/TemplateDataSource';
import PostgresUserDataSource from './postgres/UserDataSource';
import { StfcDataSource } from './stfc/StfcDataSource';
import { UserDataSource } from './UserDataSource';

export let userDataSource: UserDataSource;
if (true) { //(process.env.EXTERNAL_AUTH_PROVIDER === 'stfc') {        
    // userDataSource = new StfcDataSource(); // broken
// } else {
    userDataSource = new PostgresUserDataSource();
}
export const proposalDataSource = new PostgresProposalDataSource();
export const reviewDataSource = new PostgresReviewDataSource();
export const callDataSource = new PostgresCallDataSource();
export const fileDataSource = new PostgresFileDataSource();
export const adminDataSource = new PostgresAdminDataSource();
export const templateDataSource = new PostgresTemplateDataSource();
export const eventLogsDataSource = new PostgresEventLogsDataSource();
export const sepDataSource = new PostgresSEPDataSource();
export const instrumentDatasource = new PostgresInstrumentDataSource();
export const questionaryDataSource = new PostgresQuestionaryDataSource();
export const sampleDataSource = new PostgresSampleDataSource();
export const proposalSettingsDataSource = new PostgresProposalSettingsDataSource();
