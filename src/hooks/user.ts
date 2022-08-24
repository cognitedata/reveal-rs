import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { Chart } from 'models/chart/types';

export const useIsChartOwner = (chart?: Chart) => {
  const { data: login } = useUserInfo();

  if (!chart) {
    return false;
  }

  return login?.id === chart.user || login?.email === chart.user;
};
