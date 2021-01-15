export interface SystemDataSource {
  connectivityCheck(): Promise<boolean>;
}
