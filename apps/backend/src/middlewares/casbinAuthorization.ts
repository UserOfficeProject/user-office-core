import { getEnforcer } from '../auth/casbin/enforcer';
import { UserWithRole } from '../models/User';

export interface AuthorizationFilters {
  call?: string;
  technique?: string;
  facility?: string;
  instrument?: string;
}

/**
 * Reusable check that can be called from anywhere in the backend.
 */
export async function checkPermission(
  agent: UserWithRole | null,
  object: string,
  action: string,
  filters: AuthorizationFilters = {}
): Promise<boolean> {
  const e = await getEnforcer();

  const subject = agent?.currentRole?.id.toString;
  const call = filters.call ?? '';
  const tech = filters.technique ?? '';
  const fac = filters.facility ?? '';
  const inst = filters.instrument ?? '';

  const allowed = await e.enforce(
    subject,
    object,
    action,
    call,
    tech,
    fac,
    inst
  );

  return allowed;
}
