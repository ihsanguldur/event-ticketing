import { DefaultNamingStrategy } from 'typeorm';

function snakeCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export class SnakeNamingStrategy extends DefaultNamingStrategy {
  override columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    return (
      customName || snakeCase([...embeddedPrefixes, propertyName].join('_'))
    );
  }

  override joinColumnName(
    relationName: string,
    referencedColumnName: string,
  ): string {
    return snakeCase(`${relationName}_${referencedColumnName}`);
  }
}
