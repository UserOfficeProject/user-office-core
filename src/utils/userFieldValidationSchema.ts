/* eslint-disable @typescript-eslint/camelcase */
import { request } from 'graphql-request';
import * as Yup from 'yup';

import { Query } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

const phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/;

export const userFieldSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(2, 'firstname must be at least 2 characters')
    .max(15, 'firstname must be at most 15 characters')
    .required('firstname must be at least 2 characters'),
  lastname: Yup.string()
    .min(2, 'lastname must be at least 2 characters')
    .max(15, 'lastname must be at most 15 characters')
    .required('lastname must be at least 2 characters'),
  gender: Yup.string().required('please specify your gender'),
  nationality: Yup.number().required('please specify your nationality'),
  user_title: Yup.string().required('User title is required'),
  birthdate: Yup.date()
    .min(new Date(1900, 1, 1), 'You are not that old')
    .test('DOB', 'You must be at least 18 years old', value => {
      const dateOfBirth = new Date(value || Date.now());
      const dateNow = new Date();

      if (dateNow.getFullYear() - dateOfBirth.getFullYear() < 18) {
        return false;
      } else {
        return true;
      }
    })
    .required('Please specify your birth date'),
  organisation: Yup.number().required(
    'organisation must be at least 2 characters'
  ),
  department: Yup.string()
    .min(2, 'department must be at least 2 characters')
    .max(50, 'department must be at most 50 characters')
    .required('department must be at least 2 characters'),
  position: Yup.string()
    .min(2, 'position must be at least 2 characters')
    .max(50, 'position must be at most 50 characters')
    .required('position must be at least 2 characters'),
  email: Yup.string()
    .email('Please specify a valid email')
    .test('checkDuplEmail', 'Email has been registered before', function(
      value
    ) {
      //Check if user is using same email as before
      if (this.parent.oldEmail && this.parent.oldEmail === value) {
        return true;
      }

      if (!value) {
        return this.createError({ message: 'Please specify email' });
      }

      return new Promise(resolve => {
        const query = `query($email: String!)
      {
          checkEmailExist(email: $email)
      }`;
        request<Query>('/graphql', query, {
          email: value,
        })
          .then(data => (data.checkEmailExist ? resolve(false) : resolve(true)))
          .catch(() => resolve(false));
      });
    }),
  telephone: Yup.string()
    .min(2, 'telephone must be at least 2 characters')
    .max(30, 'telephone must be at most 20 characters')
    .matches(phoneRegExp, 'Phone number is not valid')
    .required('telephone must be at least 2 characters'),
  telephone_alt: Yup.string()
    .test('telephone_alt', 'Provided number is not valid', value => {
      if (!value) {
        return true;
      }

      return phoneRegExp.test(value);
    })
    .notRequired(),
});

export const emailFieldSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please specify a valid email')
    .test('checkDuplEmail', 'Email has been registered before', function(
      value
    ) {
      if (!value) {
        return this.createError({ message: 'Please specify email' });
      }

      return new Promise(resolve => {
        const query = `query($email: String!)
      {
          checkEmailExist(email: $email)
      }`;
        request<Query>('/graphql', query, {
          email: value,
        })
          .then(data => (data.checkEmailExist ? resolve(false) : resolve(true)))
          .catch(() => resolve(false));
      });
    }),
});

export function useNaturalKeySchema(initialValue: string) {
  const api = useDataApi();

  return Yup.string()
    .matches(/^[A-Za-z\d_]*$/, 'You can use letters, numbers and underscore')
    .max(128)
    .required('This field is required')
    .test('checkDuplNaturalKey', 'This key is already used', function(value) {
      if (!value) {
        return this.createError({ message: 'Please specify key' });
      }
      if (value === initialValue) {
        return true;
      }

      return new Promise((resolve, reject) => {
        api()
          .getIsNaturalKeyPresent({ naturalKey: value })
          .then(responseWrap => {
            const response = responseWrap.isNaturalKeyPresent;
            if (response === null) {
              reject();
            } else {
              resolve(!response);
            }
          });
      });
    });
}

export const naturalKeySchema = Yup.string();
