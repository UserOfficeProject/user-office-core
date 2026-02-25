import 'reflect-metadata';
import getAddCaseManagementRequestPayload from './AddCaseManagement';

// Mock getEnvOrThrow
jest.mock('../utils/getEnvOrThrow', () => ({
  getEnvOrThrow: (key: string) => {
    if (key === 'EAM_ORGANIZATION_CODE') return 'ESS';
    if (key === 'EAM_ORGANIZATION_NAME') return 'European Spallation Source';
    if (key === 'EAM_LOCATION_CODE') return 'HERLEV';

    return 'MOCK_VALUE';
  },
}));

describe('AddCaseManagement Request', () => {
  it('should generate correct JSON structure', () => {
    const mockDate = new Date('2023-01-01T12:00:00Z');
    const payload = getAddCaseManagementRequestPayload(
      'PROPOSAL_123',
      'Test Proposal',
      'CONTAINER_456',
      mockDate,
      'contact@email.com'
    );

    expect(payload).toMatchObject({
      CASEID: {
        CASECODE: 'string',
        ORGANIZATIONID: {
          ORGANIZATIONCODE: 'ESS',
          DESCRIPTION: 'European Spallation Source',
        },
        DESCRIPTION: 'Test Proposal',
      },
      EQUIPMENTID: {
        EQUIPMENTCODE: 'CONTAINER_456',
        ORGANIZATIONID: {
          ORGANIZATIONCODE: 'ESS',
          DESCRIPTION: 'European Spallation Source',
        },
        DESCRIPTION: 'Test Proposal',
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
        USERCODE: 'contact@email.com',
        DESCRIPTION: 'contact@email.com',
      },
      CREATEDDATE: {
        YEAR: 2023,
        MONTH: 1,
        DAY: 1,
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
          LOCATIONCODE: 'HERLEV',
          ORGANIZATIONID: {
            ORGANIZATIONCODE: 'ESS',
            DESCRIPTION: 'European Spallation Source',
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
      StandardUserDefinedFields: {
        UDFCHAR04: 'PROPOSAL_123',
      },
    });
  });
});
