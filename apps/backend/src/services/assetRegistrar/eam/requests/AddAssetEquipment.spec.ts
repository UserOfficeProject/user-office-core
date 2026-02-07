import 'reflect-metadata';
import getAddAssetEquipmentRequestPayload from './AddAssetEquipment';

// Mock getEnvOrThrow
jest.mock('../utils/getEnvOrThrow', () => ({
  getEnvOrThrow: (key: string) => {
    if (key === 'EAM_ORGANIZATION_CODE') return 'ESS';
    if (key === 'EAM_ORGANIZATION_NAME') return 'European Spallation Source';

    return 'MOCK_VALUE';
  },
}));

describe('AddAssetEquipment Request', () => {
  it('should generate correct JSON structure', () => {
    const payload = getAddAssetEquipmentRequestPayload(
      'PROPOSAL_123',
      'Test Proposal',
      '100',
      '200',
      '300',
      '400',
      'true',
      '2343',
      'No Comments',
      'No Comments',
      '100000',
      'ESS',
      'Herlev',
      '2343',
      'Copenhagen / Denmark',
      'Sender Name',
      'sender@email.com',
      '12345678',
      ['ODIN']
    );

    expect(payload).toMatchObject({
      ASSETID: {
        EQUIPMENTCODE: '',
        ORGANIZATIONID: {
          ORGANIZATIONCODE: 'ESS',
          DESCRIPTION: 'European Spallation Source',
        },
        DESCRIPTION: 'Test Proposal',
      },
      DESCRIPTION: 'Test Proposal',
      STATUS: {
        STATUSCODE: 'I',
        DESCRIPTION: 'Installed',
      },
      DEPARTMENTID: {
        DEPARTMENTCODE: 'SMPL',
        ORGANIZATIONID: {
          ORGANIZATIONCODE: '*',
          DESCRIPTION: 'Default',
        },
        DESCRIPTION: 'Sample Management',
      },
      CLASSID: {
        CLASSCODE: 'SMPCON',
        ORGANIZATIONID: {
          ORGANIZATIONCODE: '*',
          DESCRIPTION: 'Default',
        },
        DESCRIPTION: 'Sample Container',
      },
      USERDEFINEDAREA: {
        CUSTOMFIELD: expect.arrayContaining([
          expect.objectContaining({
            PROPERTYCODE: '10000001',
            TEXTFIELD: '100',
          }),
          expect.objectContaining({
            PROPERTYCODE: 'SM000013',
            TEXTFIELD: 'ODIN',
          }),
        ]),
      },
      UserDefinedFields: {
        UDFCHAR22: 'PROPOSAL_123',
      },
    });
  });
});
