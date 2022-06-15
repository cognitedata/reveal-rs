import { useQuery } from 'react-query';

import {
  DocumentCategories,
  DocumentPayload,
} from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { DOCUMENT_CATEGORIES_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { DocumentError } from '../../service/types';
import { getCategories } from '../network/getCategories';

export const useDocumentCategoryQuery = () => {
  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();

  return useQuery<DocumentCategories | DocumentError>(
    DOCUMENT_CATEGORIES_QUERY_KEY,
    () => getCategories(headers, tenant),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};

export const useQueryDocumentLabels = () => {
  const { data: categoryData, ...rest } = useDocumentCategoryQuery();

  let data: DocumentPayload[] = [];

  if (categoryData && 'labels' in categoryData) {
    data = categoryData.labels as DocumentPayload[];
  }

  return { data, ...rest };
};
