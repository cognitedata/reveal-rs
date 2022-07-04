import { GraphQlUtilsService } from './graphql-utils-service';
import { postsGraphQlSchema } from '@platypus/mock-data';
import { DataModelTypeDefsField } from '@platypus/platypus-core';

const schemaMock = postsGraphQlSchema;

describe('GraphQlUtilsServiceTest', () => {
  const createInstance = () => {
    return new GraphQlUtilsService();
  };
  it('should parse graphql schema into SolutionDataModel', () => {
    const service = createInstance();
    const result = service.parseSchema(schemaMock);

    // just make sure that there is a result
    // the rest of it is tested in the data mapper
    expect(result.types).toBeTruthy();
    const postType = result.types.find((type) => type.name === 'Post');
    expect(postType).toBeTruthy();
    expect(postType?.name).toEqual('Post');
    expect(postType?.directives?.length).toEqual(1);
    expect(postType?.directives![0].name).toEqual('template');

    const idField = postType?.fields.find(
      (field) => field.name === 'id'
    ) as DataModelTypeDefsField;

    expect(idField).toEqual(
      expect.objectContaining({
        name: 'id',
        description: undefined,
        type: { name: 'Int', list: false, nonNull: true },
        nonNull: true,
      })
    );

    const commentsField = postType?.fields.find(
      (field) => field.name === 'comments'
    ) as DataModelTypeDefsField;

    expect(commentsField).toEqual(
      expect.objectContaining({
        name: 'comments',
        description: undefined,
        type: { name: 'Comment', list: true, nonNull: false },
        nonNull: false,
      })
    );
  });

  it('should convert DataModelTypeDefsField and map directives and args', () => {
    const service = createInstance();
    const customMockSchema = `type Post {
      name(qry: String): String @searchable
    }`;
    const parsedSchema = service.parseSchema(customMockSchema);

    const nameField = parsedSchema.types[0].fields[0];
    expect(nameField.name).toEqual('name');
    expect(nameField.directives![0].name).toEqual('searchable');
    expect(nameField.arguments![0].name).toEqual('qry');
    expect(nameField.arguments![0].type.name).toEqual('String');
  });

  it('should convert SolutionDataModel into graphql schema string', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    const generatedGraphQlSchema = service.generateSdl();
    expect(generatedGraphQlSchema.trim()).toEqual(schemaMock.trim());
  });

  it('should add new type into existing SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    const newType = service.addType('Test');
    expect(newType).toEqual(
      expect.objectContaining({
        name: 'Test',
        fields: [],
      })
    );
  });

  it('can rename type name twice', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('User', { name: 'UserRenamedOnce' });
    expect(service.hasType('UserRenamedOnce')).toEqual(true);

    service.updateType('UserRenamedOnce', { name: 'UserRenamedTwice' });
    expect(service.hasType('UserRenamedTwice')).toEqual(true);
    expect(service.generateSdl()).toContain('type UserRenamedTwice');
  });

  it('can update type description', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('User', { description: 'test' });
    const type = service.getType('User');

    expect(type.description).toBe('test');
    expect(service.generateSdl()).toContain('"test"\ntype User @template {');
  });

  it('can add type directive', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('Like', { directives: [{ name: 'template' }] });
    const type = service.getType('Like');

    expect(type.directives).toContainEqual({ name: 'template', arguments: [] });
    expect(service.generateSdl()).toContain('type Like @template {');
  });

  it('can remove type directive', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);

    service.updateType('User', { directives: [] });
    const type = service.getType('User');

    expect(type.directives).toEqual([]);
    expect(service.generateSdl()).toContain('type User {');
  });

  it('should add new field into SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    const newField = service.addField('Post', 'test', {
      name: 'test',
      type: { name: 'String' },
    });

    expect(service.hasTypeField('Post', 'test')).toEqual(true);
    expect(newField).toEqual(
      expect.objectContaining({
        name: 'test',
        description: undefined,
        type: { name: 'String', list: false, nonNull: false },
        nonNull: false,
      })
    );
  });

  it('should update field into SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    let newField = service.updateTypeField('Post', 'title', {
      name: 'postTitle',
      type: { name: 'String', nonNull: true },
    });

    expect(service.hasTypeField('Post', 'title')).toEqual(false);
    expect(service.hasTypeField('Post', 'postTitle')).toEqual(true);
    expect(newField).toEqual(
      expect.objectContaining({
        name: 'postTitle',
        nonNull: true,
        type: { list: false, name: 'String', nonNull: true },
      })
    );

    newField = service.updateTypeField('Post', 'postTitle', {
      type: 'Int!',
    });

    expect(newField).toEqual(
      expect.objectContaining({
        description: undefined,
        name: 'postTitle',
        nonNull: true,
        type: { list: false, name: 'Int', nonNull: true },
      })
    );
  });

  it('should remove type from SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    service.removeType('Post');

    expect(service.hasType('Post')).toEqual(false);
  });

  it('should remove field from SolutionDataModel', () => {
    const service = createInstance();
    service.parseSchema(schemaMock);
    service.removeField('Post', 'title');

    expect(service.hasTypeField('Post', 'title')).toEqual(false);
  });

  it('should return empty string as SDL when all types are removed', () => {
    const service = createInstance();
    service.addType('Person');
    service.removeType('Person');
    expect(service.generateSdl()).toBe('');
  });
});
