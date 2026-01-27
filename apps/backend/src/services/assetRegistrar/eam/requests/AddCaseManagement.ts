import { getEnvOrThrow } from '../utils/getEnvOrThrow';

const getAddCaseManagementRequestPayload = (
  proposalTitle: string,
  containerId: string,
  dateRequested: Date,
  localContactEmail: string
) => ({
  CASEID: {
    CASECODE: 'string',
    ORGANIZATIONID: {
      ORGANIZATIONCODE: getEnvOrThrow('EAM_ORGANIZATION_CODE'),
      DESCRIPTION: getEnvOrThrow('EAM_ORGANIZATION_NAME'),
    },
    DESCRIPTION: proposalTitle,
  },
  EQUIPMENTID: {
    EQUIPMENTCODE: containerId,
    ORGANIZATIONID: {
      ORGANIZATIONCODE: getEnvOrThrow('EAM_ORGANIZATION_CODE'),
      DESCRIPTION: getEnvOrThrow('EAM_ORGANIZATION_NAME'),
    },
    DESCRIPTION: proposalTitle,
  },
  CASETYPE: {
    TYPECODE: 'CMCONT',
    DESCRIPTION: 'Container',
  },
  DEPARTMENTID: {
    DEPARTMENTCODE: 'SMPL',
    ORGANIZATIONID: {
      ORGANIZATIONCODE: '*',
      DESCRIPTION: 'Default',
    },
    DESCRIPTION: 'Sample Management',
  },
  STATUS: {
    STATUSCODE: 'O',
    DESCRIPTION: 'Open',
  },
  RSTATUS: {
    STATUSCODE: 'O',
    DESCRIPTION: 'Open',
  },
  CREATEDBY: {
    USERCODE: localContactEmail,
    DESCRIPTION: localContactEmail,
  },
  CREATEDDATE: {
    YEAR: dateRequested.getFullYear(),
    MONTH: dateRequested.getMonth() + 1,
    DAY: dateRequested.getDate(),
  },
  CaseDetails: {
    CASECLASSID: {
      CLASSCODE: 'CSM',
      ORGANIZATIONID: {
        ORGANIZATIONCODE: '*',
        DESCRIPTION: 'Default',
      },
      DESCRIPTION: 'Container Sample Management',
    },
    LOCATIONID: {
      LOCATIONCODE: getEnvOrThrow('EAM_LOCATION_CODE'),
      ORGANIZATIONID: {
        ORGANIZATIONCODE: getEnvOrThrow('EAM_ORGANIZATION_CODE'),
        DESCRIPTION: getEnvOrThrow('EAM_ORGANIZATION_NAME'),
      },
      DESCRIPTION: 'ESS Buildings',
    },
    SERVICEPROBLEMID: {
      SERVICEPROBLEMCODE: 'CSM',
      ORGANIZATIONID: {
        ORGANIZATIONCODE: '*',
        DESCRIPTION: 'Default',
      },
      DESCRIPTION: 'Container Sample Management',
    },
  },
});

export default getAddCaseManagementRequestPayload;
