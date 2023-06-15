import { mixerApiInlineTypeDirectiveName } from './constants';
import {
  DataModelTransformation,
  DataModelTypeDefs,
  DataModelVersion,
  DataModelVersionStatus,
} from './types';
import * as utils from './utils';
import { groupTransformationsByTypes } from './utils';

const dataModelTypeDefsMock: DataModelTypeDefs = {
  types: [
    {
      name: 'Post',
      fields: [
        {
          name: 'body',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'authors',
          type: {
            name: 'User',
            list: true,
            nonNull: false,
          },
          nonNull: false,
        },
      ],
    },
    {
      name: 'Comment',
      fields: [
        {
          name: 'body',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'views',
          type: {
            name: 'Int',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'post',
          type: {
            name: 'Post',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    },
    {
      name: 'User',
      directives: [
        {
          name: mixerApiInlineTypeDirectiveName,
        },
      ],
      fields: [
        {
          name: 'name',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    },
  ],
};

describe('Data model services utils', () => {
  describe('getTypesMap', () => {
    it('should only return scalar and object types', () => {
      const typesMap = utils.getTypesMap();
      expect(typesMap).toEqual({
        String: 'text',
        Int: 'int32',
        Int32: 'int32',
        Int64: 'int64',
        Float: 'float64',
        Float32: 'float32',
        Float64: 'float64',
        Timestamp: 'timestamp',
        JSONObject: 'json',
        Date: 'date',
        Boolean: 'boolean',
        TimeSeries: 'text',
        File: 'text',
        Sequence: 'text',
      });
    });
  });

  describe('getOneToManyModelName', () => {
    it('should generate name according to naming scheme "<from type>_<property name>_<version number>"', () => {
      const type = dataModelTypeDefsMock.types[0];
      const name = utils.getOneToManyModelName(
        type.name,
        type.fields[1].name,
        '1'
      );

      expect(name).toEqual('Post_authors_1');
    });
  });

  describe('isInlineType', () => {
    it('should return false if type is not inline', () => {
      expect(utils.isInlineType(dataModelTypeDefsMock.types[0])).toEqual(false);
    });

    it('should return true if type is inline', () => {
      const type = {
        name: '',
        directives: [
          {
            name: 'nested',
          },
        ],
        fields: [
          {
            name: '',
            description: '',
            type: { name: '' },
          },
        ],
      };

      expect(utils.isInlineType(type)).toEqual(true);
    });
  });

  describe('isCustomType', () => {
    it('should only return true if type is custom', () => {
      expect(utils.isCustomType('Person')).toEqual(true);
    });

    it('should only return false if type is not custom', () => {
      expect(utils.isCustomType('String')).toEqual(false);
    });
  });

  describe('getVersionedExternalId', () => {
    it('should return correct externalId according to naming scheme "<name>_<version>"', () => {
      expect(utils.getVersionedExternalId('name', '1')).toEqual('name_1');
    });
  });
});

describe('getDestinationDisplayName', () => {
  it('returns correctly for model name - v2', () => {
    expect(
      utils.getDestinationDisplayName({
        destination: {
          instanceSpaceExternalId: 'imdb',
          modelExternalId: 'Movie_2',
          spaceExternalId: 'imdb',
          type: 'data_model_instances',
        },
        externalId: 't_imdb_movie_2_1',
        id: 2,
        name: 'IMDB Movie_2 1',
      })
    ).toBe('Movie');
  });
  it('returns correctly for relations name - v2', () => {
    expect(
      utils.getDestinationDisplayName({
        destination: {
          instanceSpaceExternalId: 'imdb',
          modelExternalId: 'Movie_actors_2',
          spaceExternalId: 'imdb',
          type: 'data_model_instances',
        },
        externalId: 't_imdb_movie_2_1',
        id: 2,
        name: 'IMDB Movie_2 1',
      })
    ).toBe('Movie.actors');
  });
  it('returns correctly for model name - v3', () => {
    expect(
      utils.getDestinationDisplayName({
        destination: {
          view: { space: 'imdb', externalId: 'Movie', version: '2' },
          instanceSpace: 'imdb',
          type: 'nodes',
        },
        externalId: 't_imdb_movie_2_1',
        id: 2,
        name: 'IMDB Movie_2 1',
      })
    ).toBe('Movie');
  });
  it('returns correctly for relations name - v3', () => {
    expect(
      utils.getDestinationDisplayName({
        destination: {
          edgeType: { space: 'imdb', externalId: 'Movie.actors' },
          instanceSpace: 'imdb',
          type: 'edges',
        },
        externalId: 't_imdb_movie_2_1',
        id: 2,
        name: 'IMDB Movie_2 1',
      })
    ).toBe('Movie.actors');
  });
});

describe('groupTransformationsByTypes', () => {
  const mockTransformations: DataModelTransformation[] = [
    {
      destination: {
        instanceSpaceExternalId: 'imdb',
        modelExternalId: 'Movie_2',
        spaceExternalId: 'imdb',
        type: 'data_model_instances',
      },
      externalId: 't_imdb_movie_2_1',
      id: 2,
      name: 'IMDB Movie_2 1',
    },
    {
      destination: {
        instanceSpaceExternalId: 'imdb',
        modelExternalId: 'Movie_2',
        spaceExternalId: 'imdb',
        type: 'data_model_instances',
      },
      externalId: 't_imdb_movie_2_2',
      id: 3,
      name: 'IMDB Movie_2 2',
    },
    {
      destination: {
        instanceSpaceExternalId: 'imdb',
        modelExternalId: 'Movie_actors_2',
        spaceExternalId: 'imdb',
        type: 'data_model_instances',
      },
      externalId: 't_imdb_movie_actors_2_1',
      id: 4,
      name: 'IMDB Movie Actors 1',
    },
  ];

  it('Returns correct grouping', () => {
    expect(groupTransformationsByTypes(mockTransformations)).toEqual({
      Movie_2: {
        displayName: 'Movie',
        transformations: [
          {
            destination: {
              instanceSpaceExternalId: 'imdb',
              modelExternalId: 'Movie_2',
              spaceExternalId: 'imdb',
              type: 'data_model_instances',
            },
            externalId: 't_imdb_movie_2_1',
            id: 2,
            name: 'IMDB Movie_2 1',
          },
          {
            destination: {
              instanceSpaceExternalId: 'imdb',
              modelExternalId: 'Movie_2',
              spaceExternalId: 'imdb',
              type: 'data_model_instances',
            },
            externalId: 't_imdb_movie_2_2',
            id: 3,
            name: 'IMDB Movie_2 2',
          },
        ],
      },
      Movie_actors_2: {
        displayName: 'Movie.actors',
        transformations: [
          {
            destination: {
              instanceSpaceExternalId: 'imdb',
              modelExternalId: 'Movie_actors_2',
              spaceExternalId: 'imdb',
              type: 'data_model_instances',
            },
            externalId: 't_imdb_movie_actors_2_1',
            id: 4,
            name: 'IMDB Movie Actors 1',
          },
        ],
      },
    });
  });

  describe('compareDataModelVersions', () => {
    it('sorts correctly', () => {
      const dataModelVersions: DataModelVersion[] = [
        {
          externalId: 'foo',
          space: 'foo',
          status: DataModelVersionStatus.PUBLISHED,
          version: 'three',
          createdTime: 1666341041026,
          schema: '',
        },
        {
          externalId: 'foo',
          space: 'foo',
          status: DataModelVersionStatus.PUBLISHED,
          version: 'no time',
          schema: '',
        },
        {
          externalId: 'foo',
          space: 'foo',
          status: DataModelVersionStatus.PUBLISHED,
          version: 'four',
          createdTime: 1666787116635,
          schema: '',
        },
        {
          externalId: 'foo',
          space: 'foo',
          status: DataModelVersionStatus.PUBLISHED,
          version: 'two',
          createdTime: 1666250631722,
          schema: '',
        },
        {
          externalId: 'foo',
          space: 'foo',
          status: DataModelVersionStatus.PUBLISHED,
          version: 'one',
          createdTime: 1666171691371,
          schema: '',
        },
      ];

      const sortedArray = dataModelVersions.sort(
        utils.compareDataModelVersions
      );

      expect(
        sortedArray.map((dataModelVersion) => dataModelVersion.version)
      ).toEqual(['four', 'three', 'two', 'one', 'no time']);
    });
  });
});
