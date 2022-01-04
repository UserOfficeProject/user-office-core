import { BaseSyntheticEvent } from 'react';

// Addressing the bug https://github.com/jaredpalmer/formik/issues/721
const isEventFromAutoComplete = (event: BaseSyntheticEvent) =>
  (event.nativeEvent as Record<string, unknown>).view === undefined;

export default isEventFromAutoComplete;
