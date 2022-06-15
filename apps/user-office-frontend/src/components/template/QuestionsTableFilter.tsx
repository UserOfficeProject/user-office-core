import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';

import { creatableQuestions } from 'components/questionary/QuestionaryComponentRegistry';
import { DataType, QuestionsFilter, TemplateCategoryId } from 'generated/sdk';
import { useTemplateCategories } from 'hooks/template/useTemplateCategories';

interface QuestionsTableFilterProps {
  onChange?: (filter: QuestionsFilter) => unknown;
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  textSearch: {
    width: 300,
  },
}));

function QuestionsTableFilter(props: QuestionsTableFilterProps) {
  const classes = useStyles();
  const { categories } = useTemplateCategories();
  const [category, setCategory] = useState<TemplateCategoryId | undefined>();
  const [questionType, setQuestionType] = useState<DataType[] | undefined>();
  const [searchText, setSearchText] = useState<string | undefined>();

  const handleChange = (update: Partial<QuestionsFilter>) => {
    props.onChange?.({
      dataType: questionType,
      text: searchText,
      category: category,
      ...update,
    });
  };

  return (
    <div data-cy="questions-table-filter">
      <FormControl className={classes.formControl}>
        <InputLabel shrink>Category</InputLabel>
        <Select
          onChange={(e) => {
            const newCategory = e.target.value as TemplateCategoryId;
            setCategory(newCategory);
            handleChange({ category: newCategory });
          }}
          value={category ?? ''}
          data-cy="category-dropdown"
        >
          <MenuItem value={undefined} key={'None'}>
            All
          </MenuItem>
          {categories.map((category) => (
            <MenuItem value={category.categoryId} key={category.categoryId}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel shrink>Type</InputLabel>
        <Select
          onChange={(e) => {
            const value = e.target.value as DataType | undefined;
            const newDataType = value ? [value] : undefined;

            setQuestionType(newDataType);
            handleChange({ dataType: newDataType });
          }}
          value={questionType ?? ''}
          data-cy="type-dropdown"
        >
          <MenuItem value={undefined} key={'None'}>
            All
          </MenuItem>
          {creatableQuestions.map((questionType) => (
            <MenuItem value={questionType.dataType} key={questionType.dataType}>
              {questionType.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={`${classes.formControl} ${classes.textSearch}`}>
        <InputLabel shrink>Search</InputLabel>
        <TextField
          label=" "
          value={searchText ?? ''}
          margin="none"
          onChange={(event) => setSearchText(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              const trimmedSearchText = searchText?.trim();
              setSearchText(trimmedSearchText);
              handleChange({ text: trimmedSearchText });
              event.preventDefault();
            }
          }}
          data-cy="search-input"
        />
      </FormControl>
    </div>
  );
}

export default QuestionsTableFilter;
