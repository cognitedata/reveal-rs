import moment, { Moment } from 'moment';
import { RunStatusAPI, RunStatusUI } from 'model/Status';
import { RunApi, RunUI } from 'model/Runs';

const STATUS_RUN_STATUS_MAP: Readonly<Map<RunStatusUI, RunStatusAPI>> = new Map<
  RunStatusUI,
  RunStatusAPI
>([
  [RunStatusUI.SUCCESS, RunStatusAPI.SUCCESS],
  [RunStatusUI.FAILURE, RunStatusAPI.FAILURE],
  [RunStatusUI.SEEN, RunStatusAPI.SEEN],
]);

export const mapStatusRun = (
  status?: RunStatusUI
): RunStatusAPI | undefined => {
  return status ? STATUS_RUN_STATUS_MAP.get(status) : undefined;
};

export const mapStatus = (apiStatus?: RunStatusAPI | string): RunStatusUI => {
  if (apiStatus?.toLowerCase() === RunStatusAPI.SUCCESS) {
    return RunStatusUI.SUCCESS;
  }
  if (apiStatus?.toLowerCase() === RunStatusAPI.FAILURE) {
    return RunStatusUI.FAILURE;
  }
  if (apiStatus?.toLowerCase() === RunStatusAPI.SEEN) {
    return RunStatusUI.SEEN;
  }
  return RunStatusUI.NOT_ACTIVATED;
};

export const filterRuns = (data?: RunApi[]): RunUI[] => {
  return data
    ? mapStatusRow(
        data.filter(({ status }) => {
          return status !== RunStatusAPI.SEEN;
        })
      )
    : [];
};

export const filterByStatus = (runStatus: RunStatusUI) => {
  return ({ status }: RunUI) => {
    return status === runStatus;
  };
};
export const and = <T>(
  predicate1: (value: T) => boolean,
  predicate2: (value: T) => boolean
) => {
  return (value: T) => {
    return predicate1(value) && predicate2(value);
  };
};

export const filterByTimeBetween = (startTime: Moment, endTime: Moment) => {
  return ({ createdTime }: Pick<RunUI, 'createdTime'>) => {
    return moment(createdTime).isBetween(startTime, endTime);
  };
};
export const isWithinDaysInThePast = (days: number) =>
  filterByTimeBetween(moment().subtract(days, 'days'), moment());

export const mapStatusRow = (statusRow: RunApi[]): RunUI[] => {
  return statusRow.map((row) => ({ ...row, status: mapStatus(row.status) }));
};
export const filterRunsByStatus = (
  statusRow: RunUI[],
  runStatus: RunStatusUI
): RunUI[] => {
  return statusRow.filter(filterByStatus(runStatus));
};
export const filterRunsByTime = (
  statusRow: RunUI[],
  startTime: Moment,
  endTime: Moment
): RunUI[] => {
  return statusRow.filter(filterByTimeBetween(startTime, endTime));
};
