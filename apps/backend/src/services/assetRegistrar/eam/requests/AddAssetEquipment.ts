import { getEnvOrThrow } from '../utils/getEnvOrThrow';

const date = new Date();

const getAddAssetEquipmentRequestPayload = (
  proposalId: string,
  proposalTitle: string,
  partCode: string,
  weightKilograms: number,
  widthMeters: number,
  heightMeters: number,
  lengthMeters: number,
  isDangerousGoods: string,
  dangerousGoodsUnNumber: string,
  dangerousGoodsDetails: string,
  shipmentSampleRisks: string,
  parcelValue: string,
  shipmentSenderCompany: string,
  shipmentSenderStreetAddress: string,
  shipmentSenderZipCode: string,
  shipmentSenderCityCountry: string,
  shipmentSenderName: string,
  shipmentSenderEmail: string,
  shipmentSenderPhone: string,
  instrumentShortCodes: string[]
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
