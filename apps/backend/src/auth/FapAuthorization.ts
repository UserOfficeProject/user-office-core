import { inject, injectable } from 'tsyringe';
import { Tokens } from '../config/Tokens';
import { PermissionDataSource } from '../datasources/PermissionDataSource';
import { UserWithRole } from '../models/User';
import { FapDataSource } from '../datasources/FapDataSource';

@injectable()
export class FapAuthorization {
  constructor(
    @inject(Tokens.FapDataSource)
    private fapDataSource: FapDataSource,
    @inject(Tokens.PermissionDataSource)
    private permissionDataSource: PermissionDataSource
  ) {}

  async canEdit(agent: UserWithRole | null, fapId: number) {
    const fap = await this.fapDataSource.getFap(fapId);

    const user = {
      role: agent?.currentRole?.shortCode,
      userId: agent?.id,
    };

    const ctx = {fap, user}
    return this.permissionDataSource.hasPermission(user.role ? user.role : 'user', 'update', 'fap', ctx);
  }
}