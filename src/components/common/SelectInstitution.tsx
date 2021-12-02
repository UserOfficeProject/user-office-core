import { Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { Institution } from 'generated/sdk';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';

import FormikDropdown from './FormikDropdown';
import UOLoader from './UOLoader';

interface SelectInstitutionProps {
  institution: Institution;
  onClose: (institution: Institution | null) => void;
}

function SelectInstitution(props: SelectInstitutionProps) {
  const { institutions, loadingInstitutions } = useInstitutionsData();

  if (loadingInstitutions) {
    return <UOLoader />;
  }

  return (
    <Formik
      initialValues={{
        institution: null,
      }}
      onSubmit={(values) => {
        props.onClose(values.institution);
      }}
      validationSchema={Yup.object().shape({
        institution: Yup.number().required('Institution is required'),
      })}
    >
      <FormikDropdown
        name="organisation"
        label="Organisation"
        items={institutions.map((institution) => ({
          value: institution.id,
          text: institution.name,
        }))}
        data-cy="organisation"
      />
    </Formik>
  );
}

export default SelectInstitution;
