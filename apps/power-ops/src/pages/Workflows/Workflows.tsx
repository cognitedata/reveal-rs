import { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { CogniteEvent } from '@cognite/sdk';
import {
  EVENT_TYPES,
  PROCESS_TYPES,
  Workflow,
} from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchWorkflows } from 'queries/useFetchWorkflows';
import { OptionType, Select } from '@cognite/cogs.js';
import { useFetchWorkflowSchemas } from 'queries/useFetchWorkflowSchemas';
import { EVENT_STATUSES } from 'utils/utils';
import { useFetchWorkflowTypes } from 'queries/useFetchWorkflowTypes';
import queryString from 'query-string';

import { ReusableTable } from './ReusableTable';
import { Container, SearchAndFilter } from './elements';
import { workflowsColumns } from './utils';

export const Workflows = () => {
  const { eventStore } = useContext(EventStreamContext);

  const match = useRouteMatch();
  const history = useHistory();
  const { search } = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(search), [search]);

  const [filteredWorkflows, setFilteredWorkflows] = useState<
    Workflow[] | undefined
  >([]);
  const { data: workflows, refetch: refetchWorkflows } = useFetchWorkflows();

  // Setup for table filters
  const [workflowTypeFilterValue, setWorkflowTypeFilterValue] = useState<
    OptionType<string>[]
  >([]);
  const [workflowTypeFilterOptions, setWorkflowTypeFilterOptions] = useState<
    OptionType<string>[]
  >([]);
  const [statusFilterValue, setStatusFilterValue] = useState<
    OptionType<string>[]
  >([]);
  const [statusFilterOptions] = useState<OptionType<string>[]>(
    EVENT_STATUSES.map((status: string) => ({
      label: status,
      value: status,
    }))
  );

  const { data: { workflowSchemas } = { workflowSchemas: [], count: 0 } } =
    useFetchWorkflowSchemas();

  const { data: workflowTypes } = useFetchWorkflowTypes();

  const isWorkflowEvent = async (needle: string): Promise<boolean> => {
    return !!(
      workflowSchemas?.some((schema) => schema.workflowType === needle) ||
      workflowSchemas?.some((schema) => needle.includes(schema.workflowType))
    );
  };

  const processEvent = async (event: CogniteEvent): Promise<void> => {
    if (!event.externalId) return;

    switch (event.type) {
      case PROCESS_TYPES.DAY_AHEAD_BID_MATRIX_CALCULATION:
        if (await isWorkflowEvent(event.externalId)) {
          refetchWorkflows({ cancelRefetch: true });
        }
        break;
      case EVENT_TYPES.PROCESS_STARTED:
      case EVENT_TYPES.PROCESS_FAILED:
      case EVENT_TYPES.PROCESS_FINISHED:
        // For status Events, we check that they are attached to (parent) Bid Processes and not to sub-processes.
        if (
          event.metadata?.event_external_id &&
          (await isWorkflowEvent(event.metadata.event_external_id))
        )
          refetchWorkflows({ cancelRefetch: true });
        break;
    }
  };

  useEffect(() => {
    refetchWorkflows({ cancelRefetch: true });
    const subscription = eventStore?.subscribe(({ event }) => {
      processEvent(event);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Set workflow type filter dropdown options
    const workflowTypeOptions =
      workflowTypes?.map(({ workflowType }) => ({
        label: workflowType,
        value: workflowType,
      })) || [];

    setWorkflowTypeFilterOptions(workflowTypeOptions);
  }, [workflowTypes]);

  // Get filters from the URL
  useEffect(() => {
    const parsedURL = queryString.parse(search);
    if (parsedURL.workflowType) {
      setWorkflowTypeFilterValue(
        parsedURL.workflowType
          ?.toString()
          .split(',')
          .map((filter) => {
            return { label: filter, value: filter };
          })
      );
    }
    if (parsedURL.status) {
      setStatusFilterValue(
        parsedURL.status
          ?.toString()
          .split(',')
          .map((filter) => {
            return {
              label: filter,
              value: filter,
            };
          })
      );
    }
  }, []);

  // Add filters to the URL
  useEffect(() => {
    if (workflowTypeFilterValue.length) {
      urlParams.set(
        'workflowType',
        workflowTypeFilterValue.map((filter) => filter.value).join(',')
      );
    } else {
      urlParams.delete('workflowType');
    }
    if (statusFilterValue.length) {
      urlParams.set(
        'status',
        statusFilterValue.map((filter) => filter.value).join(',')
      );
    } else {
      urlParams.delete('status');
    }

    history.replace({
      pathname: `${match.path}`,
      search: urlParams.toString(),
    });
  }, [workflowTypeFilterValue, statusFilterValue]);

  // Filter table data by selected filter options
  useEffect(() => {
    setFilteredWorkflows(
      workflowTypeFilterValue.length || statusFilterValue.length
        ? workflows?.filter(
            (workflow) =>
              Object.values(workflow).some((value) =>
                workflowTypeFilterValue.length
                  ? workflowTypeFilterValue
                      .map((filter) => filter.value)
                      .includes(value?.toString())
                  : true
              ) &&
              Object.values(workflow).some((value) =>
                statusFilterValue.length
                  ? statusFilterValue
                      .map((filter) => filter.label.toLowerCase())
                      .includes(String(value).toLowerCase())
                  : true
              )
          )
        : workflows
    );
  }, [search, workflows]);

  return (
    <Container>
      <SearchAndFilter>
        <Select
          theme="grey"
          title="Workflow type:"
          isMulti
          showSelectedItemCount
          value={workflowTypeFilterValue}
          options={workflowTypeFilterOptions}
          onChange={(selected: OptionType<string>[]) => {
            setWorkflowTypeFilterValue(selected);
          }}
        />
        <Select
          theme="grey"
          title="Status:"
          isMulti
          showSelectedItemCount
          value={statusFilterValue}
          options={statusFilterOptions}
          onChange={(selected: OptionType<string>[]) => {
            setStatusFilterValue(selected);
          }}
        />
      </SearchAndFilter>
      {filteredWorkflows && (
        <ReusableTable data={filteredWorkflows} columns={workflowsColumns} />
      )}
    </Container>
  );
};
