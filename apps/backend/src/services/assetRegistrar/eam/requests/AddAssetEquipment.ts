const date = new Date();

/**
 * Add Asset Equipment
 * @param proposalTitle title of the proposal
 * @param weightKilograms weight in kilograms
 * @param widthMeters width in meters
 * @param heightMeters height in meters
 * @param lengthMeters length in meters
 * @returns the JSON Payload
 */
const getRequest = (
  partCode: string,
  proposalId: string,
  proposalTitle: string,
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
  description: proposalTitle.substr(0, 80),
  organization: 'ESS',
  code: partCode,
  typeCode: 'A',
  statusCode: 'C',
  departmentCode: 'SMPL',
});

export default getRequest;
