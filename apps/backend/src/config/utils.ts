import { container, Lifecycle } from 'tsyringe';

export const mapClass = (
  type: symbol,
  clazz: any,
  lifecycle: Lifecycle = Lifecycle.Singleton
) => {
  container.register(
    type,
    {
      useClass: clazz,
    },
    { lifecycle: lifecycle }
  );
};

export const mapValue = <T>(type: symbol, value: T) => {
  container.register(type, {
    useValue: value,
  });
};

export async function fetchData(url: string) {
  try {
    // Making the GET request to the URL
    const response = await fetch(url);

    // Checking if the response status is not OK (200-299)
    if (!response.ok) {
      // Throwing an error with the response status text if the request was not successful
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parsing the JSON response body
    const data = await response.json();

    // Returning the parsed data
    return data;
  } catch (error) {
    // Re-throwing the error for further handling if necessary
    throw error;
  }
}
