import { setTimezone, setDateTimeFormats } from '../setTimezoneAndFormat';

export async function configureBaseEnvironment() {
  await setTimezone();
  await setDateTimeFormats();
}
