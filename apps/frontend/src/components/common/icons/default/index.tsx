import {
  AccountBalance,
  AccountCircle,
  CalendarToday,
  Dashboard,
  Description,
  DisplaySettings,
  DynamicFeed,
  Email,
  Event,
  EventNote,
  ExitToApp,
  Feedback,
  FlightTakeoff,
  FolderOpen,
  Functions,
  GroupWork,
  Help,
  HomeOutlined,
  Inbox,
  LibraryBooks,
  LocalShipping,
  Mail,
  ManageAccounts,
  NoteAdd,
  People,
  PictureAsPdf,
  Science,
  Settings,
  SettingsApplications,
  SupervisedUserCircle,
  SwitchAccountOutlined,
  Topic,
  ViewModule,
  VpnKey,
} from '@mui/icons-material';

import CommentQuestionIcon from '../CommentQuestionIcon';
import EsiIcon from '../EsiIcon';
import { IconComponent } from '../IconPackIcon';
import ProposalSettingsIcon from '../ProposalSettingsIcon';
import ProposalWorkflowIcon from '../ProposalWorkflowIcon';
import ScienceIcon from '../ScienceIcon';
import TagIcon from '../TagIcon';

const defaultIconPack = {
  // Sidebar Menu Items

  Dashboard,
  NewProposal: NoteAdd,
  ExperimentTimes: Event,
  Help,
  ReviewProposals: FolderOpen,
  InstrumentScientistInstruments: GroupWork, // Is this intended? Or should be the same as Instrument icon for user officers?
  Call: CalendarToday,
  Proposal: FolderOpen,
  TechniqueProposal: Topic,
  Experiment: Event,
  FAP: GroupWork,
  Instrument: ScienceIcon,
  Technique: Science,
  Tag: TagIcon,
  ProposalWorkflow: ProposalWorkflowIcon,
  Institution: AccountBalance,
  // Templates
  Template: LibraryBooks,
  ExpSafetyReviewTemplate: Description,
  ProposalTemplate: Description,
  FAPReviewTemplate: Description,
  TechnicalReviewTemplate: Description,
  SampleDeclarationTemplate: Inbox,
  EmailTemplate: Email,
  SubTemplate: DynamicFeed,
  ShipmentDeclarationTemplate: LocalShipping,
  VisitRegistrationTemplate: FlightTakeoff,
  // Templates/ESI
  ESITemplate: EsiIcon,
  ESIProposalTemplate: Description,
  ESISampleTemplate: Inbox,
  // Templates/PDF
  PDFTemplate: PictureAsPdf,
  PDFProposalTemplate: Description,
  PDFExperimentSafetyTemplate: Inbox,
  // Templates/Feedback
  FeedbackTemplate: Feedback,
  // Status Action Logs
  StatusActionLogsSingle: Mail,
  StatusActionLogsExpandable: EventNote,
  StatusActionLogsEmail: Mail,
  StatusActionLogsProposalDownload: PictureAsPdf,
  // People
  People,
  // Questions
  Questions: CommentQuestionIcon,
  // Configuration Settings
  ConfigurationSettings: Settings,
  Unit: Functions,
  Page: SettingsApplications,
  ProposalStatuses: ProposalSettingsIcon,
  ExperimentWorkflows: Science,
  APIAccessToken: VpnKey,
  RoleManagement: ManageAccounts,
  Feature: ViewModule,
  AppSettings: DisplaySettings,

  // Account Menu

  Account: AccountCircle,
  ManageAccounts,
  Logout: ExitToApp,
  Roles: SupervisedUserCircle,
  FacilitiesHomepage: HomeOutlined,
  UnImpersonate: SwitchAccountOutlined,
} satisfies Record<string, IconComponent>;

export default defaultIconPack;
