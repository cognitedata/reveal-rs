import { UMSUser } from '@cognite/user-management-service-types';

export const getMockUmsUsers = (extras: UMSUser[] = []): UMSUser[] => [
  {
    displayName: 'test name',
    email: '',
    projects: [],
    id: 'testId_1',
    createdTime: '',
    lastUpdatedTime: '',
  },
  {
    displayName: 'test name 2',
    email: '',
    projects: [],
    id: 'testId_2',
    createdTime: '',
    lastUpdatedTime: '',
  },
  {
    displayName: '',
    email: 'test-email',
    projects: [],
    id: 'testId_3',
    createdTime: '',
    lastUpdatedTime: '',
  },
  {
    displayName: '',
    email: '',
    projects: [],
    id: 'testId_4',
    createdTime: '',
    lastUpdatedTime: '',
  },
  {
    id: '1',
    displayName: 'John Doe',
    projects: [],
    createdTime: '1',
    lastUpdatedTime: '1',
  },
  ...extras,
];
