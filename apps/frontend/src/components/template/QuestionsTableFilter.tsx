import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

import { creatableQuestions } from 'components/questionary/QuestionaryComponentRegistry';
import { DataType, QuestionsFilter, TemplateCategoryId } from 'generated/sdk';
import { useTemplateCategories } from 'hooks/template/useTemplateCategories';

interface QuestionsTableFilterProps {
  onChange?: (filter: QuestionsFilter) => unknown;
}

function QuestionsTableFilter(props: QuestionsTableFilterProps) {
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
    <Grid container spacing={2} data-cy="questions-table-filter">
      <Grid item sm={4} xs={12}>
        <FormControl fullWidth>
          <InputLabel id="filter-category">Category</InputLabel>
          <Select
            onChange={(e) => {
              const newCategory = e.target.value as TemplateCategoryId;
              setCategory(newCategory);
              handleChange({ category: newCategory });
            }}
            value={category ?? ''}
            labelId="filter-category"
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
      </Grid>
      <Grid item sm={4} xs={12}>
        <FormControl fullWidth>
          <InputLabel id="filter-type">Type</InputLabel>
          <Select
            onChange={(e) => {
              const value = e.target.value as DataType | undefined;
              const newDataType = value ? [value] : undefined;

              setQuestionType(newDataType);
              handleChange({ dataType: newDataType });
            }}
            value={questionType ?? ''}
            labelId="filter-type"
            data-cy="type-dropdown"
          >
            <MenuItem value={undefined} key={'None'}>
              All
            </MenuItem>
            {creatableQuestions.map((questionType) => (
              <MenuItem
                value={questionType.dataType}
                key={questionType.dataType}
              >
                {questionType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item sm={4} xs={12}>
        <FormControl fullWidth>
          <TextField
            label="Search"
            value={searchText ?? ''}
            margin="none"
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => {
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
      </Grid>
    </Grid>
  );
}

export default QuestionsTableFilter;
