import 'reflect-metadata';

export const AgentTagsMetadataKey = Symbol('AgentTags');

export const AgentTags = (
  target: object,
  propertyKey: string | symbol,
  parameterIndex: number
) => {
  const existingParameters: number[] =
    Reflect.getOwnMetadata(AgentTagsMetadataKey, target, propertyKey) || [];
  existingParameters.push(parameterIndex);
  Reflect.defineMetadata(
    AgentTagsMetadataKey,
    existingParameters,
    target,
    propertyKey
  );
};
