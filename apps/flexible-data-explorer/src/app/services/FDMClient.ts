// This file contains a bare-bones version of
// https://github.com/cognitedata/industry-apps/blob/master/packages/e2e-fdm/src/fdm/fdm-client.ts

import type { CogniteClient } from '@cognite/sdk';
import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import { query } from 'gql-query-builder';
import Fields from 'gql-query-builder/build/Fields';
import head from 'lodash/head';

export interface FDMError {
  extensions: { classification: string };
  locations: { column: number; line: number };
  message: string;
}

//https://greenfield.cognitedata.com/api/v1/projects/dss-dev/dml/graphql

/**
 * This class can be used for interactions with CDF
 * You can create your own class that extends from this one
 * and add methods that handle data that is specific to your application.
 */
class BaseFDMClient {
  // private DMS_HEADERS: Record<string, string>;
  protected BASE_URL: string;
  protected client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
    this.BASE_URL = `${client.getBaseUrl()}/api/v1/projects/${client.project}`;
    // this.DMS_HEADERS = { 'cdf-version': 'alpha' };
  }

  private request<T>(
    url: string,
    data: { query: string; variables?: Record<string, any> }
  ) {
    return this.client
      .post<{ data: T; errors: FDMError[] }>(url, {
        data,
      })
      .then((result) => {
        if (result.data.errors) {
          const { errors } = result.data;
          throw new Error(
            errors.length > 0
              ? JSON.stringify(errors.map((error) => error.message))
              : 'Error connecting to server'
          );
        }
        return result.data.data;
      });
  }

  public gqlRequest<T>(
    data: { query: string; variables?: Record<string, any> },
    {
      space,
      dataModel,
      version,
    }: { space: string; dataModel: string; version: string }
  ): Promise<T> {
    const url = `${this.BASE_URL}/userapis/spaces/${space}/datamodels/${dataModel}/versions/${version}/graphql`;

    return this.request<T>(url, data);
  }

  public dmlRequest<T>(data: {
    query: string;
    variables?: Record<string, any>;
  }) {
    const url = `${this.BASE_URL}/dml/graphql`;

    return this.request<T>(url, data);
  }

  public async introspectionQuery(
    dataType: string,
    headers: { space: string; dataModel: string; version: string }
  ) {
    const result = query({
      operation: { name: '__type', alias: 'allFields' },
      fields: [
        'name',
        {
          fields: [
            'name',
            { type: ['name', 'kind', { ofType: ['name', 'kind'] }] },
          ],
        },
      ],
      variables: {
        name: {
          value: dataType,
          required: true,
        },
      },
    });

    return this.gqlRequest<IntrospectionResponse>(result, headers).then(
      (data) => {
        return data.allFields.fields.map((field) => ({
          field: field.name,
          kind: field.type.name || field.type.ofType.name,
        }));
      }
    );
  }

  public parseSchema(graphQlDml?: string) {
    if (!graphQlDml) {
      return undefined;
    }

    return new GraphQlUtilsService().parseSchema(graphQlDml);
  }
}

export class FDMClient extends BaseFDMClient {
  public async listDataModels(limit = 100) {
    const operation = 'listGraphQlDmlVersions';

    const data = query({
      operation,
      fields: [
        {
          items: [
            'space',
            'externalId',
            'version',
            'name',
            'description',
            'createdTime',
            'lastUpdatedTime',
          ],
        },
      ],
      variables: { limit },
    });

    const {
      [operation]: { items },
    } = await this.dmlRequest<{
      listGraphQlDmlVersions: {
        items: DataModelList[];
      };
    }>(data);

    return items;
  }

  public async getDataModelById({
    space,
    dataModel,
    version,
  }: {
    space: string;
    dataModel: string;
    version: string;
  }) {
    const operation = 'graphQlDmlVersionsById';

    const data = query({
      operation,
      fields: [
        {
          items: ['name', 'description', 'graphQlDml', 'version'],
        },
      ],
      variables: {
        space: { value: space, required: true },
        externalId: { value: dataModel, required: true },
      },
    });

    const {
      [operation]: { items },
    } = await this.dmlRequest<{
      [operation]: {
        items: {
          graphQlDml: string;
          version: string;
          name: string;
          description: string;
        }[];
      };
    }>(data);

    const item = items.find((item) => item.version === String(version));

    return item;
  }

  public async getInstanceById<T>(
    fields: Fields,
    {
      dataType,
      externalId,
      ...headers
    }: {
      space: string;
      dataModel: string;
      version: string;
      dataType: string;
      externalId: string;
    }
  ) {
    const operation = `get${dataType}ById`;

    const payload = query({
      operation,
      fields: [
        {
          items: fields,
        },
      ],
      variables: {
        instance: {
          type: 'InstanceRef = {space: "", externalId: ""}',
          value: { externalId, space: headers.space },
        },
      },
    });

    const {
      [operation]: { items },
    } = await this.gqlRequest<{
      [operation in string]: {
        items: T[];
      };
    }>(payload, headers);

    return head(items);

    // return this.gqlRequest<T>(payload, headers);
  }
}

type IntrospectionResponse = {
  allFields: {
    fields: {
      name: string;
      type: {
        name: string;
        kind: 'scalar' | 'object';
        ofType: {
          name: string;
          kind: 'scalar' | 'object';
        };
      };
    }[];
  };
};

// public async upsertNodes<T extends { externalId?: string }>(
//   modelName: string,
//   nodes: T[]
// ) {
//   const data = {
//     items: nodes.map(({ externalId, ...properties }) => ({
//       instanceType: 'node',
//       space: this.SPACE_EXTERNAL_ID,
//       externalId,
//       sources: [
//         {
//           source: {
//             type: 'container',
//             space: this.SPACE_EXTERNAL_ID,
//             externalId: modelName,
//           },
//           properties,
//         },
//       ],
//     })),
//   };
//   return this.client.post<{ items: T[] }>(this.baseUrlDms, {
//     data,
//     headers: this.DMS_HEADERS,
//     withCredentials: true,
//   });
// }

// public async deleteNodes(externalIds: string[] | string) {
//   const externalIdsAsArray = Array.isArray(externalIds)
//     ? externalIds
//     : [externalIds];
//   const data = {
//     items: externalIdsAsArray.map((externalId) => ({
//       instanceType: 'node',
//       space: this.SPACE_EXTERNAL_ID,
//       externalId,
//     })),
//   };
//   return this.client.post(`${this.baseUrlDms}/delete`, {
//     data,
//     headers: this.DMS_HEADERS,
//     withCredentials: true,
//   });
// }

export type DataModelList = {
  space: string;
  externalId: string;
  version: string;
  name?: string;
  description?: string;
  createdTime?: string | number;
  lastUpdatedTime?: string | number;
};
