import { AssetRegistrar } from '../AssetRegistrar';

export class SkipAssetRegistrar implements AssetRegistrar {
  async register(): Promise<string> {
    return '12345';
  }
}
