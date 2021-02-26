import { useFormikContext } from 'formik';
import { useEffect } from 'react';

import { FunctionType } from 'utils/utilTypes';

const PreventTabChangeIfFormDirty = ({
  setFormDirty,
  initialValues,
}: {
  setFormDirty: FunctionType<void, boolean>;
  initialValues: unknown;
}) => {
  const formik = useFormikContext();

  useEffect(() => {
    const isFormDirty =
      formik.dirty &&
      JSON.stringify(formik.values) !== JSON.stringify(initialValues);

    if (isFormDirty) {
      setFormDirty(true);
    } else {
      setFormDirty(false);
    }
  }, [formik.dirty, formik.values, setFormDirty, initialValues]);

  return null;
};

export default PreventTabChangeIfFormDirty;
