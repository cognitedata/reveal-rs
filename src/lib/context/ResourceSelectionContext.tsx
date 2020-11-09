import React, { useContext, useState, useEffect } from 'react';
import queryString from 'query-string';
import { ResourceItem, ResourceType } from 'lib/types';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';
import { useHistory } from 'react-router-dom';

export type ResourceItemState = ResourceItem & {
  state: 'disabled' | 'active' | 'selected';
};

export type ResourceSelectionObserver = {
  allowEdit: boolean;
  setAllowEdit: (newMode: boolean) => void;
  resourceTypes: ResourceType[];
  setResourceTypes: (newTypes: ResourceType[]) => void;
  assetFilter: AssetFilterProps;
  setAssetFilter: React.Dispatch<React.SetStateAction<AssetFilterProps>>;
  timeseriesFilter: TimeseriesFilter;
  setTimeseriesFilter: React.Dispatch<React.SetStateAction<TimeseriesFilter>>;
  fileFilter: FileFilterProps;
  setFileFilter: React.Dispatch<React.SetStateAction<FileFilterProps>>;
  eventFilter: EventFilter;
  setEventFilter: React.Dispatch<React.SetStateAction<EventFilter>>;
  sequenceFilter: SequenceFilter['filter'];
  setSequenceFilter: React.Dispatch<
    React.SetStateAction<SequenceFilter['filter']>
  >;
  queryKey: string;
};

export const ResourceSelectionContext = React.createContext(
  {} as ResourceSelectionObserver
);
ResourceSelectionContext.displayName = 'ResourceSelectionContext';

export const useResourceTypes = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.resourceTypes;
};

export const useResourceEditable = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.allowEdit;
};

export const useQuery: () => [string, (q: string) => void] = () => {
  const history = useHistory();
  const key = useContext(ResourceSelectionContext).queryKey;
  const search = queryString.parse(history?.location?.search);
  const query = (search[key] || '') as string;

  const setQuery = (q?: string) =>
    history.push({
      pathname: history?.location?.pathname,
      search: queryString.stringify({
        ...search,
        [key]: q || undefined,
      }),
    });
  return [query, setQuery];
};

export const useResourceFilter = (type: ResourceType) => {
  const observer = useContext(ResourceSelectionContext);
  switch (type) {
    case 'asset': {
      return observer.assetFilter;
    }
    case 'event': {
      return observer.eventFilter;
    }
    case 'file': {
      return observer.fileFilter;
    }
    case 'sequence': {
      return observer.sequenceFilter;
    }
    case 'timeSeries': {
      return observer.timeseriesFilter;
    }
    default:
      throw new Error('Unknown sdk type');
  }
};

export const useResourceFilters = () => {
  const observer = useContext(ResourceSelectionContext);
  return {
    assetFilter: observer.assetFilter,
    timeseriesFilter: observer.timeseriesFilter,
    eventFilter: observer.eventFilter,
    sequenceFilter: observer.sequenceFilter,
    fileFilter: observer.fileFilter,
  };
};

export type ResourceSelectionProps = {
  /**
   * Allow users to have access to editing/creating utilities
   */
  allowEdit?: boolean;
  /**
   * Allowed resource types, default is all resources
   */
  resourceTypes?: ResourceType[];
  /**
   * The initial asset filter
   */
  assetFilter?: AssetFilterProps;
  /**
   * The initial timeseries filter
   */
  timeseriesFilter?: TimeseriesFilter;
  /**
   * The initial file filter
   */
  fileFilter?: FileFilterProps;
  /**
   * The initial event filter
   */
  eventFilter?: EventFilter;
  /**
   * The initial sequence filter
   */
  sequenceFilter?: SequenceFilter['filter'];
  /**
   * The search param where the currrent query is stored. Default value is 'query'.
   */
  queryKey?: string;

  children?: React.ReactNode;
};

export const ResourceSelectionProvider = ({
  allowEdit: propsAllowEdit,
  resourceTypes: initialResourceTypes,
  assetFilter: initialAssetFilter,
  timeseriesFilter: initialTimeseriesFilter,
  fileFilter: initialFileFilter,
  eventFilter: initialEventFilter,
  sequenceFilter: initialSequenceFilter,
  queryKey = 'query',
  children,
}: ResourceSelectionProps) => {
  const [allowEdit, setAllowEdit] = useState<boolean>(propsAllowEdit || false);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>(
    initialResourceTypes || ['asset', 'file', 'event', 'sequence', 'timeSeries']
  );
  const [assetFilter, setAssetFilter] = useState<AssetFilterProps>(
    initialAssetFilter || {}
  );
  const [timeseriesFilter, setTimeseriesFilter] = useState<TimeseriesFilter>(
    initialTimeseriesFilter || {}
  );
  const [fileFilter, setFileFilter] = useState<FileFilterProps>(
    initialFileFilter || {}
  );
  const [eventFilter, setEventFilter] = useState<EventFilter>(
    initialEventFilter || {}
  );
  const [sequenceFilter, setSequenceFilter] = useState<
    SequenceFilter['filter']
  >(initialSequenceFilter || {});

  useEffect(() => {
    if (initialResourceTypes) {
      setResourceTypes(initialResourceTypes);
    }
  }, [initialResourceTypes]);

  return (
    <ResourceSelectionContext.Provider
      value={{
        allowEdit,
        setAllowEdit,
        resourceTypes,
        setResourceTypes,
        assetFilter,
        setAssetFilter,
        timeseriesFilter,
        setTimeseriesFilter,
        fileFilter,
        setFileFilter,
        eventFilter,
        setEventFilter,
        sequenceFilter,
        setSequenceFilter,
        queryKey,
      }}
    >
      {children}
    </ResourceSelectionContext.Provider>
  );
};
export default ResourceSelectionContext;
