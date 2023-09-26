import 'reflect-metadata';

const metadataKey = Symbol('Response');

export function Response(): (target: any, propertyKey: string) => void {
  return (target: any, propertyKey: string) => {
    let properties: string[] = Reflect.getMetadata(metadataKey, target);

    if (properties) {
      properties.push(propertyKey);
    } else {
      properties = [propertyKey];
      Reflect.defineMetadata(metadataKey, properties, target);
    }
  };
}

function getResponseFields(origin: any): any {
  const properties: string[] = Reflect.getMetadata(metadataKey, origin) || [];
  const result: any = {};
  properties.forEach((key) => (result[key] = origin[key]));

  return result;
}

export function getResponseField(origin: any): string | null {
  const responseFields = getResponseFields(origin);
  const keys = Object.keys(responseFields);
  if (keys.length !== 1) {
    // response wrapper must have one and only one key decorated with @Response
    return null;
  }

  return keys[0];
}
