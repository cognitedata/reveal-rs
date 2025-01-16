import { DataSourceType } from '@cognite/reveal';
import { DmsUniqueIdentifier } from '../../data-providers';

export type Image360AnnotationContent = DataSourceType['image360AnnotationType'];
export type Image360AnnotationId = number | DmsUniqueIdentifier;
