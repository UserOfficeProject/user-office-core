import "reflect-metadata";

const metadataKey = Symbol("Response");

export function Response(): (target: object, propertyKey: string) => void {
  return (target: object, propertyKey: string) => {
    let properties: string[] = Reflect.getMetadata(metadataKey, target);

    if (properties) {
      properties.push(propertyKey);
    } else {
      properties = [propertyKey];
      Reflect.defineMetadata(metadataKey, properties, target);
    }
  };
}

export function getResponseField(origin: any): string | null {
  const responseFields = getResponseFields(origin);
  const keys = Object.keys(responseFields);
  if (keys.length === 1) {
    // response wrapper must have one and only one key decorated with @Response
    return keys[0];
  }
  return null;
}

function getResponseFields(origin: any): object {
  const properties: string[] = Reflect.getMetadata(metadataKey, origin);
  const result: any = {};
  properties.forEach(key => (result[key] = origin[key]));
  return result;
}
