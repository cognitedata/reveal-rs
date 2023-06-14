import moment from 'moment';
import { User } from '@extraction-pipelines/model/User';
import { DetailFieldNames } from '@extraction-pipelines/model/Extpipe';
import { toCamelCase } from '@extraction-pipelines/utils/primitivesUtils';
import { mapScheduleInputToScheduleValue } from '@extraction-pipelines/utils/cronUtils';
import { AddExtpipeFormInput } from '@extraction-pipelines/pages/create/CreateExtpipe';
import { Range } from '@cognite/cogs.js';
import { RunStatus } from '@extraction-pipelines/model/Runs';

export const calculateLatest = (timesStampsInMs: number[]): number => {
  if (timesStampsInMs.length === 0) {
    return 0;
  }
  return moment
    .max(timesStampsInMs.map((time) => moment(time)))
    .toDate()
    .getTime();
};

export const addIfExist = <T>(value?: T): T[] => {
  return value ? [value] : [];
};

type Partitioned<T> = { pass: T[]; fail: T[] };
export const partition = <T>(
  list: Array<T>,
  predicate: (item: T) => boolean
): Partitioned<T> => {
  return list.reduce(
    (acc: { pass: T[]; fail: T[] }, current: T) => {
      return predicate(current)
        ? { ...acc, pass: [...acc.pass, current] }
        : { ...acc, fail: [...acc.fail, current] };
    },
    { pass: [], fail: [] }
  );
};

export const isOwner = (contact: User): boolean => {
  return (
    !!contact.role &&
    contact.role.toLowerCase() === DetailFieldNames.OWNER.toLowerCase()
  );
};

export const updateContactField = (
  contacts: User[],
  fieldName: keyof User,
  idx: number
) => {
  return contacts.map((c: User, i: number) => {
    if (i === idx) {
      return { ...c, ...{ [fieldName]: !c[fieldName] } };
    }
    return c;
  });
};

const constructMetadata = (
  metadata: {
    description: string;
    content: string;
  }[]
) => {
  if (!metadata) {
    return null;
  }
  return metadata.map((field) => {
    const key = toCamelCase(field.description);
    return { [key]: field.content };
  });
};

export const createAddExtpipeInfo = (
  fields: AddExtpipeFormInput,
  user: any
) => {
  const {
    source,
    schedule,
    cron,
    name,
    externalId,
    description,
    contacts,
    dataSetId: fieldDataSetId,
    selectedRawTables,
    documentation,
  } = fields;
  const metadata = constructMetadata(fields.metadata);
  const scheduleToStore = mapScheduleInputToScheduleValue({
    schedule,
    cron,
  });
  return {
    name,
    externalId,
    ...(description && { description }),
    ...(fieldDataSetId && { dataSetId: fieldDataSetId }),
    ...(metadata && {
      metadata: Object.assign({}, ...metadata),
    }),
    ...(contacts && { contacts }),
    ...(source && { source }),
    ...(!!scheduleToStore && { schedule: scheduleToStore }),
    ...(selectedRawTables && { rawTables: selectedRawTables }),
    ...(documentation && { documentation }),
    ...(user && {
      createdBy:
        user.displayName || user.email || user.mail || user.id || user.user,
    }),
  };
};

type QueryParams = {
  search?: string;
  statuses?: string;
  env?: string;
  min?: string;
  max?: string;
  cluster?: string;
};
export const getQueryParams = (search: string): QueryParams => {
  const params = new URLSearchParams(search);
  return Array.from(params.entries()).reduce((acc, [key, value]) => {
    return { ...acc, [key]: value };
  }, {});
};

interface CreateSearchParams {
  search: string;
  statuses: RunStatus[];
  dateRange: Range;
  env?: string;
  cluster?: string;
}
export const createSearchParams = ({
  env,
  search,
  statuses,
  dateRange,
  cluster,
}: CreateSearchParams) => {
  const params = {
    ...(env && { env }),
    ...(search && { search }),
    ...(statuses.length && { statuses: statuses.join(',') }),
    ...(dateRange?.endDate && { max: `${dateRange?.endDate?.getTime()}` }),
    ...(dateRange?.startDate && { min: `${dateRange?.startDate?.getTime()}` }),
    ...(cluster && { cluster }),
  };
  return new URLSearchParams(params).toString();
};
