import { FormControlLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { Field, FieldArray } from 'formik';
import { TextField } from 'formik-mui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import { MultiPartSelectionConfig } from '../../../../generated/sdk';
import TitledContainer from '../../../common/TitledContainer';
import { QuestionTemplateRelationFormProps } from '../../QuestionaryComponentRegistry';
import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationMultiPartSelectionForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          required: Yup.bool(),
          selectionPairs: Yup.array().of(
            Yup.object().shape({
              key: Yup.string(),
              value: Yup.array().of(Yup.string()),
            })
          ),
        }),
      })}
    >
      {(formikProps) => (
        <>
          <TitledContainer label={'Constraints'}>
            <FormControlLabel
              control={
                <Field
                  name={'config.required'}
                  component={Checkbox}
                  type={'checkbox'}
                  inputProps={{ 'data-cy': 'required' }}
                />
              }
              label={'Is required'}
            />
          </TitledContainer>
          <TitledContainer label={'Question Configuration'}>
            <Field
              name={'config.partOneQuestion'}
              component={TextField}
              type={'text'}
              label={'Question Part One'}
              fullWidth
            />
            <Field
              name={'config.partTwoQuestion'}
              component={TextField}
              type={'text'}
              label={'Question Part Two'}
              fullWidth
            />
          </TitledContainer>
          <TitledContainer label={'Answer Configuration'}>
            <FieldArray
              name={'config.selectionPairs'}
              render={(arrayHelpers) => (
                <div>
                  {(
                    formikProps.values.config as MultiPartSelectionConfig
                  ).selectionPairs.map((pair, index) => (
                    <TitledContainer label={'Answer Pair'} key={`${index}`}>
                      <Field name={`config.selectionPairs[${index}].key`} />

                      <FieldArray
                        name={`config.selectionPairs[${index}].value`}
                        render={(arrayHelpers) => (
                          <div>
                            {(
                              formikProps.values
                                .config as MultiPartSelectionConfig
                            ).selectionPairs[index].value.map((v, index_) => (
                              <div key={index_}>
                                <Field
                                  name={`config.selectionPairs[${index}].value[${index_}]`}
                                />
                                <Button
                                  onClick={() => arrayHelpers.remove(index)}
                                >
                                  Remove Part 2 Answer Option
                                </Button>
                              </div>
                            ))}
                            <Button
                              onClick={() =>
                                arrayHelpers.push({
                                  key: '',
                                  value: [],
                                })
                              }
                            >
                              Add Part 2 Answer Option
                            </Button>
                          </div>
                        )}
                      />

                      <Button onClick={() => arrayHelpers.remove(index)}>
                        Remove
                      </Button>
                    </TitledContainer>
                  ))}
                  <Button
                    onClick={() =>
                      arrayHelpers.push({
                        key: '',
                        value: [],
                      })
                    }
                  >
                    Add Answer Pair
                  </Button>
                </div>
              )}
            />
          </TitledContainer>
          <TitledContainer label={'Dependencies'}>
            <QuestionDependencyList
              template={props.template}
              form={formikProps}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
