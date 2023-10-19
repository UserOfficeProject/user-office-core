import { Help } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  tableCellClasses,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import { Field } from 'formik';
import { Checkbox, Select, TextField } from 'formik-mui';
import React, { useState } from 'react';
import * as Yup from 'yup';

import FormikUICustomTable from 'components/common/FormikUICustomTable';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import {
  ApiCallRequestHeader,
  DynamicMultipleChoiceConfig,
} from 'generated/sdk';
import { urlValidationSchema } from 'utils/helperFunctions';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';
const columns = [
  { title: 'Name', field: 'name' },
  { title: 'Value', field: 'value' },
];

const jsonPathFieldsDocRows = [
  {
    operator: '$',
    description: 'The root element to query. This starts all path expressions.',
  },
  {
    operator: '@',
    description: 'The current node being processed by a filter predicate.',
  },
  {
    operator: '*',
    description: 'Wildcard. Available anywhere a name or numeric are required.',
  },
  {
    operator: '..',
    description: 'Deep scan. Available anywhere a name is required.',
  },
  {
    operator: '.<name>',
    description: 'Dot-notated child',
  },
  {
    operator: "['<name>' (, '<name>')]",
    description: 'Bracket-notated child or children',
  },
  {
    operator: '[<number> (, <number>)]',
    description: 'Array index or indexes',
  },
  {
    operator: '[start:end]',
    description: 'Array slice operator',
  },
  {
    operator: '[?(<expression>)]',
    description:
      'Filter expression. Expression must evaluate to a boolean value.',
  },
];

const CustomizedTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const CustomizedTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const HeaderWrapper = styled(Paper)`
  padding: 10px 5px;
  margin: 20px 0 0 0;
`;

export const QuestionDynamicMultipleChoiceForm = (props: QuestionFormProps) => {
  const field = props.question;
  const config = field.config as DynamicMultipleChoiceConfig;

  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const urlValidation = urlValidationSchema();
  const [showIsMultipleSelectCheckbox, setShowIsMultipleSelectCheckbox] =
    useState(config.variant === 'dropdown');

  const availableVariantOptions = [
    { label: 'Radio', value: 'radio' },
    { label: 'Dropdown', value: 'dropdown' },
  ];

  const [isJsonPathFieldDocPopupOpen, setIsJsonPathFieldDocPopupOpen] =
    useState(false);

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
          url: urlValidation,
          jsonPath: Yup.string(),
          apiRequestHeaders: Yup.array(),
        }),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="Key-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            id="Question-input"
            label="Question"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Constraints">
            <FormControlLabel
              control={
                <Field
                  name="config.required"
                  component={Checkbox}
                  type="checkbox"
                  inputProps={{ 'data-cy': 'required' }}
                />
              }
              label="Is required"
            />
          </TitledContainer>

          <TitledContainer label="Options">
            <FormControl fullWidth>
              <InputLabel htmlFor="config.variant" shrink>
                Variant
              </InputLabel>
              <Field
                id="config.variant"
                name="config.variant"
                type="text"
                component={Select}
                data-cy="variant"
                onChange={(e: SelectChangeEvent) => {
                  setShowIsMultipleSelectCheckbox(
                    e.target.value === 'dropdown'
                  );
                }}
              >
                {availableVariantOptions.map(({ value, label }) => {
                  return (
                    <MenuItem value={value} key={value}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Field>
            </FormControl>

            {showIsMultipleSelectCheckbox && (
              <FormControlLabel
                control={
                  <Field
                    name="config.isMultipleSelect"
                    component={Checkbox}
                    type="checkbox"
                    inputProps={{ 'data-cy': 'is-multiple-select' }}
                  />
                }
                label="Is multiple select"
              />
            )}
          </TitledContainer>

          <TitledContainer label="Dynamic URL">
            <FormControl fullWidth>
              <InputLabel htmlFor="config.url" shrink>
                Link
              </InputLabel>
              <Field
                name="config.url"
                id="config.url"
                type="text"
                component={TextField}
                fullWidth
                inputProps={{ 'data-cy': 'dynamic-url' }}
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel htmlFor="config.jsonPath" shrink>
                JsonPath
              </InputLabel>
              <Field
                name="config.jsonPath"
                id="config.jsonPath"
                type="text"
                component={TextField}
                fullWidth
                inputProps={{ 'data-cy': 'dynamic-url-jsonPath' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setIsJsonPathFieldDocPopupOpen(true)}
                      >
                        <Help />
                      </IconButton>
                      <Dialog
                        open={isJsonPathFieldDocPopupOpen}
                        onClose={() => setIsJsonPathFieldDocPopupOpen(false)}
                        aria-labelledby="customized-dialog-title"
                      >
                        <DialogContent>
                          <div>
                            JsonPath expressions always refer to a JSON
                            structure in the same way as XPath expression are
                            used in combination with an XML document. The
                            &quot;root member object&quot; in JsonPath is always
                            referred to as $ regardless if it is an object or
                            array.
                            <br />
                            <br />
                            JsonPath expressions can use the dot–notation
                            <br />
                            <Box
                              component="div"
                              sx={{
                                display: 'block',
                                p: 2,
                                my: 1,
                                bgcolor: 'grey.300',
                                color: 'grey.800',
                                border: '1px solid',
                                borderColor: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? 'grey.800'
                                    : 'grey.300',
                                borderRadius: 2,
                                fontSize: '0.875rem',
                              }}
                            >
                              <code>$.store.book[0].title</code>
                            </Box>
                            or the bracket–notation
                            <br />
                            <Box
                              component="div"
                              sx={{
                                display: 'block',
                                p: 2,
                                my: 1,
                                bgcolor: 'grey.300',
                                color: 'grey.800',
                                border: '1px solid',
                                borderColor: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? 'grey.800'
                                    : 'grey.300',
                                borderRadius: 2,
                                fontSize: '0.875rem',
                              }}
                            >
                              <code>
                                $[&apos;store&apos;][&apos;book&apos;][0][&apos;title&apos;]
                              </code>
                            </Box>
                            <h3>Operators</h3>
                            <TableContainer component={Paper}>
                              <Table aria-label="customized table">
                                <TableHead
                                  sx={{
                                    background: 'background.default',
                                  }}
                                >
                                  <TableRow>
                                    <CustomizedTableCell width={'45%'}>
                                      <strong>Operator</strong>
                                    </CustomizedTableCell>
                                    <CustomizedTableCell width={'55%'}>
                                      <strong>Description</strong>
                                    </CustomizedTableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {jsonPathFieldsDocRows.map((row) => (
                                    <CustomizedTableRow key={row.operator}>
                                      <CustomizedTableCell
                                        component="th"
                                        scope="row"
                                      >
                                        <code>{row.operator}</code>
                                      </CustomizedTableCell>
                                      <CustomizedTableCell>
                                        {row.description}
                                      </CustomizedTableCell>
                                    </CustomizedTableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </div>
                        </DialogContent>
                        <DialogActions>
                          <Button
                            variant="text"
                            onClick={() =>
                              setIsJsonPathFieldDocPopupOpen(false)
                            }
                          >
                            CLOSE
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
            <FormControl>
              <TitledContainer label="Api request headers">
                <Field
                  title=""
                  name="config.apiCallRequestHeaders"
                  component={FormikUICustomTable}
                  columns={columns}
                  dataTransforms={{
                    toTable: (options: ApiCallRequestHeader[]) => options,
                    fromTable: (rows: Record<string, unknown>[]) => rows,
                  }}
                  fullWidth
                  data-cy="options"
                />
              </TitledContainer>
            </FormControl>
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
