import { createLink } from '@cognite/cdf-utilities';
import { Asset, InternalId, Timeseries } from '@cognite/sdk';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Filter, SourceType } from 'types/api';
import { useContextState } from 'utils';

const QUICK_MATCH_STEPS = [
  'select-sources',
  'select-targets',
  'configure-model',
  'create-model',
] as const;
export type QuickMatchStep = (typeof QUICK_MATCH_STEPS)[number];

const getQuickMatchStepOrder = (step?: string): number => {
  const index = QUICK_MATCH_STEPS.findIndex((value) => value === step);
  return index;
};

export type EMFeatureType =
  | 'simple'
  | 'insensitive'
  | 'bigram'
  | 'frequencyweightedbigram'
  | 'bigramextratokenizers'
  | 'bigramcombo';

type TimeseriesKeys = keyof Pick<Timeseries, 'unit' | 'name' | 'description'>;
type AssetKeys = keyof Pick<Asset, 'name' | 'description'>;

export type ModelMapping = { source?: TimeseriesKeys; target?: AssetKeys }[];

export type Scope = 'all' | 'unmatched';

type QuickMatchContext = {
  featureType: EMFeatureType;
  setFeatureType: Dispatch<SetStateAction<EMFeatureType>>;

  supervisedMode: boolean;
  setSupervisedMode: Dispatch<SetStateAction<boolean>>;

  scope: Scope;
  setScope: Dispatch<SetStateAction<Scope>>;

  unmatchedOnly: boolean;
  setUnmatchedOnly: Dispatch<SetStateAction<boolean>>;

  sourceType: SourceType;
  setSourceType: Dispatch<SetStateAction<SourceType>>;

  allSources: boolean;
  setAllSources: Dispatch<SetStateAction<boolean>>;

  sourcesList: InternalId[];
  setSourcesList: Dispatch<SetStateAction<InternalId[]>>;

  sourceFilter: Filter;
  setSourceFilter: Dispatch<SetStateAction<Filter>>;

  targetFilter: Filter;
  setTargetFilter: Dispatch<SetStateAction<Filter>>;

  allTargets: boolean;
  setAllTargets: Dispatch<SetStateAction<boolean>>;

  targetsList: InternalId[];
  setTargetsList: Dispatch<SetStateAction<InternalId[]>>;

  hasNextStep: () => boolean;
  hasPrevStep: () => boolean;
  pushStep: () => void;
  popStep: () => void;

  matchFields: ModelMapping;
  setModelFieldMapping: Dispatch<SetStateAction<ModelMapping>>;
};

export const QuickMatchContext = createContext<QuickMatchContext>({
  allSources: false,
  sourcesList: [],
  setSourcesList: function (_: SetStateAction<InternalId[]>): void {
    throw new Error('Function not implemented.');
  },
  allTargets: false,
  setAllTargets: function (_: SetStateAction<boolean>): void {
    throw new Error('Function not implemented.');
  },
  targetsList: [],
  setTargetsList: function (_: SetStateAction<InternalId[]>): void {
    throw new Error('Function not implemented.');
  },
  setAllSources: function (_: SetStateAction<boolean>): void {
    throw new Error('Function not implemented.');
  },
  sourceFilter: {
    dataSetIds: [],
  },
  setSourceFilter: function (_: SetStateAction<Filter>): void {
    throw new Error('Function not implemented.');
  },
  targetFilter: {
    dataSetIds: [],
  },
  setTargetFilter: function (_: SetStateAction<Filter>): void {
    throw new Error('Function not implemented.');
  },
  hasNextStep: function (): boolean {
    throw new Error('Function not implemented.');
  },
  hasPrevStep: function (): boolean {
    throw new Error('Function not implemented.');
  },
  pushStep: function (): void {
    throw new Error('Function not implemented.');
  },
  popStep: function (): void {
    throw new Error('Function not implemented.');
  },
  sourceType: 'timeseries',
  setSourceType: function (_: SetStateAction<SourceType>): void {
    throw new Error('Function not implemented.');
  },
  matchFields: [{ source: 'name', target: 'name' }],
  setModelFieldMapping: function (_: SetStateAction<ModelMapping>): void {
    throw new Error('Function not implemented.');
  },

  setUnmatchedOnly: function (_: SetStateAction<boolean>): void {
    throw new Error('Function not implemented.');
  },
  unmatchedOnly: false,
  supervisedMode: false,
  setSupervisedMode: function (_: SetStateAction<boolean>): void {
    throw new Error('Function not implemented.');
  },
  featureType: 'simple',
  setFeatureType: function (_: SetStateAction<EMFeatureType>): void {
    throw new Error('Function not implemented.');
  },
  scope: 'all',
  setScope: function (_: SetStateAction<Scope>): void {
    throw new Error('Function not implemented.');
  },
});

export const useQuickMatchContext = () => useContext(QuickMatchContext);

export const QuickMatchContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const params = useParams<{
    '*': string;
    subAppPath: string;
  }>();

  const { '*': step, subAppPath } = params;

  const navigate = useNavigate();

  const [featureType, setFeatureType] = useContextState<EMFeatureType>(
    'simple',
    'featureType'
  );

  const [scope, setScope] = useContextState<Scope>('all', 'scope');

  const [supervisedMode, setSupervisedMode] = useContextState(
    false,
    'supervisedMode'
  );

  const [unmatchedOnly, setUnmatchedOnly] = useContextState(
    false,
    'unmatchedOnly'
  );
  const [allSources, setAllSources] = useContextState(false, 'allSources');
  const [sourcesList, setSourcesList] = useContextState<InternalId[]>(
    [],
    'sourcesList'
  );
  const [allTargets, setAllTargets] = useContextState(false, 'allTargets');
  const [targetsList, setTargetsList] = useContextState<InternalId[]>(
    [],
    'targetsList'
  );
  const [sourceFilter, setSourceFilter] = useContextState<Filter>(
    {
      dataSetIds: [],
    },
    'sourceFilter'
  );
  const [targetFilter, setTargetFilter] = useContextState<Filter>(
    {
      dataSetIds: [],
    },
    'targetFilter'
  );

  const [modelFieldMapping, setModelFieldMapping] =
    useContextState<ModelMapping>([{ source: 'name', target: 'name' }]);
  const [sourceType, setSourceType] = useContextState<SourceType>(
    'timeseries',
    'sourceType'
  );

  const hasNextStep = () => {
    const order = getQuickMatchStepOrder(step);
    return order >= 0 && order < QUICK_MATCH_STEPS.length - 1;
  };

  const hasPrevStep = () => {
    const order = getQuickMatchStepOrder(step);
    return order > 0 && order < QUICK_MATCH_STEPS.length;
  };

  const pushStep = () => {
    if (!hasNextStep()) {
      throw new Error('No futher steps');
    }
    const order = getQuickMatchStepOrder(step);
    const next = QUICK_MATCH_STEPS[order + 1];
    navigate(createLink(`/${subAppPath}/quick-match/create/${next}`));
  };
  const popStep = () => {
    if (!hasPrevStep()) {
      throw new Error('No steps before this');
    }
    const order = getQuickMatchStepOrder(step);
    const next = QUICK_MATCH_STEPS[order - 1];
    navigate(createLink(`/${subAppPath}/quick-match/create/${next}`));
  };
  return (
    <QuickMatchContext.Provider
      value={{
        allSources,
        setAllSources,
        sourcesList,
        setSourcesList,
        allTargets,
        setAllTargets,
        targetsList,
        setTargetsList,
        hasNextStep,
        hasPrevStep,
        pushStep,
        popStep,
        sourceFilter,
        setSourceFilter,
        sourceType,
        setSourceType,
        matchFields: modelFieldMapping,
        setModelFieldMapping,
        unmatchedOnly,
        setUnmatchedOnly,
        targetFilter,
        setTargetFilter,
        supervisedMode,
        setSupervisedMode,
        featureType,
        setFeatureType,
        scope,
        setScope,
      }}
    >
      {children}
    </QuickMatchContext.Provider>
  );
};
