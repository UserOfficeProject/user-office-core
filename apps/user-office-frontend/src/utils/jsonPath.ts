import jsonpath from 'jsonpath';

type dataType = Record<string, unknown> | Record<string, unknown>[];

export const filteredData = (data: dataType, jsonPath: string) => {
  try {
    const jsonPathFilteredData = jsonpath.value(data, jsonPath);

    return jsonPathFilteredData;
  } catch (error) {
    console.error(error);
  }
};
