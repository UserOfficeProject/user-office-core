import { setTimezone, setDateTimeFormats } from '../setTimezoneAndFormat';
import { updateOIDCSettings } from '../updateOIDCSettings';

export async function configureBaseEnvironment() {
  await setTimezone();
  await setDateTimeFormats();
  await updateOIDCSettings();
}
