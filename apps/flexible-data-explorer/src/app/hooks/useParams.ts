import { useSearchParams } from 'react-router-dom';

export enum ParamKeys {
  ExpandedId = 'expandedId',
}

export const useExpandedIdParams = (): [
  string | undefined,
  (id?: string) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const expandedId = searchParams.get(ParamKeys.ExpandedId) ?? undefined;

  const setExpandedId = (id?: string) => {
    setSearchParams((currentParams) => {
      if (id === undefined) {
        currentParams.delete(ParamKeys.ExpandedId);
        return currentParams;
      }

      return {
        ...currentParams,
        [ParamKeys.ExpandedId]: id,
      };
    });
  };

  return [expandedId, setExpandedId];
};

export const useSearchQueryParams = () => {
  const [searchParams] = useSearchParams();

  return searchParams.get('searchQuery') || '';
};
