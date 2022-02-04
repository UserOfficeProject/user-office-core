export interface AssetRegistrar {
  register(shipmentId: number): Promise<string>;
}
