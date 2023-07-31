import { DataModelV2, Instance } from '../../services/types';

export interface InstancePreviewProps {
  onClick?: (view?: 'properties' | { type: string; field: string }) => void;
  instance?: Instance;
  dataModel?: DataModelV2;
  disabled?: boolean;
}

export type PreviewView =
  | 'properties'
  | { type: string; field: string }
  | undefined;
