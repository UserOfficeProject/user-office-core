const TestFilter = (definedTags: string[], runTest: any) => {
  if (Cypress.env('TEST_TAGS')) {
    const tags = Cypress.env('TEST_TAGS').split(',');
    const isFound = definedTags.some((definedTag) => tags.includes(definedTag));

    if (isFound) {
      runTest();
    }
  }
};

export default TestFilter;
