import { getEnvOrThrow } from '../utils/getEnvOrThrow';

const date = new Date();

const getAddAssetEquipmentRequestPayload = (
  proposalId: string,
  proposalTitle: string
) => ({
  ASSETID: {
    EQUIPMENTCODE: proposalId + '-' + date.valueOf(),
    ORGANIZATIONID: {
      ORGANIZATIONCODE: getEnvOrThrow('EAM_ORGANIZATION_CODE'),
      DESCRIPTION: getEnvOrThrow('EAM_ORGANIZATION_NAME'),
    },
    DESCRIPTION: proposalTitle,
  },
  DESCRIPTION: proposalTitle,
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
});

export default getAddAssetEquipmentRequestPayload;
