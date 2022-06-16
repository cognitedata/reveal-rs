import { Metadata } from '@cognite/sdk';
import { Wellbore as WellboreV2 } from '@cognite/sdk-wells-v2';
import {
  DoglegSeverity,
  DoglegSeverityUnit as DoglegSeverityUnitV3,
  Wellbore as WellboreV3,
} from '@cognite/sdk-wells-v3';

export interface Wellbore
  extends Omit<WellboreV2, 'id' | 'wellId' | 'sourceWellbores'>,
    Partial<Omit<WellboreV3, 'name' | 'matchingId'>> {
  id: string;
  wellName?: string;
  matchingId: string;
  wellId?: string;
  sourceWellbores: {
    id: string;
    externalId: string;
    source: string;
  }[];
  sequences?: WellSequence[];
  metadata?: Metadata;
  parentExternalId?: string;
  description?: string;
  maxMeasuredDepth?: number;
  maxTrueVerticalDepth?: number;
  maxDoglegSeverity?: DoglegSeverity;
}

interface WellSequence {
  name: string;
  id: number;
  metadata: WellSequenceMetadata;
}

interface WellSequenceMetadata {
  subtype: string;
  type: string;
  source: string;
  fileType: string;
}

export type DogLegSeverityUnit = DoglegSeverityUnitV3;
