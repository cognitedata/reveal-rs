import { QueryKey } from '@tanstack/react-query';

import { GetCallArgs, GetCallsArgs } from '../types';

type CallsArg = {
  id: number;
  scheduleId?: number;
};
export function callsKey(args: CallsArg | CallsArg[]): QueryKey {
  return [allCallsPrefix, ...Object.values(args)];
}
export function callKey(args: GetCallArgs): QueryKey {
  return [callPrefix, args];
}
export function logsKey(args: GetCallsArgs): QueryKey {
  return ['/function/logs', args];
}
export function responseKey(args: GetCallArgs): QueryKey {
  return ['/function/call/response', args];
}
export function filesKey(args: CallsArg) {
  return ['/files', args.id];
}
export function functionKey({ id }: { id: number }): QueryKey {
  return [functionPrefix, id];
}
export const callPrefix = '/function/call';
export const allCallsPrefix = '/function/calls';
export const sortFunctionKey = '/functions/calls-for-sorting';
export const allFunctionsKey = '/functions';
export const allSchedulesKey = '/functions/schedules';
export const limitsKey = '/functions/limits';
export const functionPrefix = '/function';
