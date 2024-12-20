import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { creatableQuestions } from 'components/questionary/QuestionaryComponentRegistry';
import { DataType, QuestionsFilter, TemplateCategoryId } from 'generated/sdk';
import { useTemplateCategories } from 'hooks/template/useTemplateCategories';

interface QuestionsTableFilterProps {
  onChange?: (filter: QuestionsFilter) => unknown;
}

function QuestionsTableFilter(props: QuestionsTableFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySearchParam = searchParams.get(
    'category'
  ) as TemplateCategoryId;
  const typeSearchParam = searchParams.get('type') as DataType;

  const { categories } = useTemplateCategories();
  const [category, setCategory] = useState<TemplateCategoryId | undefined>(
    categorySearchParam ?? undefined
  );
  const [questionType, setQuestionType] = useState<DataType[] | undefined>(
    typeSearchParam ? [typeSearchParam] : undefined
  );

  const handleChange = (update: Partial<QuestionsFilter>) => {
    props.onChange?.({
      dataType: questionType,
      category: category,
      ...update,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item sm={4} xs={12}>
        <FormControl fullWidth>
          <InputLabel id="filter-category">Category</InputLabel>
          <Select
            onChange={(e) => {
              setSearchParams((searchParams) => {
                searchParams.delete('category');
                if (e.target.value)
                  searchParams.set('category', e.target.value);

                return searchParams;
              });

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

              setSearchParams((searchParams) => {
                searchParams.delete('type');
                if (value) searchParams.set('type', value);

                return searchParams;
              });

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
    </Grid>
  );
}

export default QuestionsTableFilter;
