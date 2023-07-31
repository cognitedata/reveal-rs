export default {
  visibleColumns: [
    'statusColor',
    'status_active',
    'conf_name',
    'sourceProject',
    'targetProject',
    'progress',
    'actions',
  ],
  nonSortableColumns: ['statusColor', 'actions'],
  columnNameMapping: [
    {
      keyName: 'statusColor',
      value: '',
    },
    {
      keyName: 'sourceProject',
      value: 'Repository',
    },
    {
      keyName: 'targetProject',
      value: 'Project',
    },
    {
      keyName: 'status_actve',
      value: 'Created time',
    },
    {
      keyName: 'connector',
      value: 'Source',
    },
    {
      keyName: 'last_updated',
      value: 'Last updated',
    },
    {
      keyName: 'business_tags',
      value: 'Business tags',
    },
    {
      keyName: 'data_status',
      value: 'Status tags',
    },
    {
      keyName: 'status_active',
      value: 'Status',
    },
    {
      keyName: 'conf_name',
      value: 'Name',
    },
  ],
};
