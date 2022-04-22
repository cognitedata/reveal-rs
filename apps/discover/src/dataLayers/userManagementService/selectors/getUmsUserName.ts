import { UMSUser } from '@cognite/user-management-service-types';

export const getUmsUserName = (user: UMSUser, currentUserId = ''): string => {
  const userName = user.displayName || user.email || 'Unknown';

  return user.id && user.id === currentUserId ? `${userName} (you)` : userName;
};
