import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import { ANNOTATION_FETCH_BULK_SIZE } from 'src/constants/FetchConstants';
import { from, lastValueFrom } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';
import { convertCDFAnnotationToVisionAnnotations } from 'src/api/annotation/converters';
import { cognitePlaygroundClient } from 'src/api/annotation/CognitePlaygroundClient';

export const RetrieveAnnotations = createAsyncThunk<
  VisionAnnotation<VisionAnnotationDataType>[],
  { fileIds: number[]; clearCache?: boolean },
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  const { fileIds: fetchFileIds } = payload;

  /**
   * fetch new (V2 annotators using sdk)
   */
  const fileIdBatches = splitListIntoChunks(
    fetchFileIds,
    ANNOTATION_FETCH_BULK_SIZE
  );
  const requests = fileIdBatches.map((fileIds) => {
    const filterPayload: any = {
      annotatedResourceType: 'file',
      annotatedResourceIds: fileIds.map((id) => ({ id })),
    };
    const annotationListRequest = {
      filter: filterPayload,
      limit: 1000, // todo: [VIS-882] make limit to -1 for this to work
    };
    return cognitePlaygroundClient.annotations.list(annotationListRequest);
  });

  let visionAnnotations: VisionAnnotation<VisionAnnotationDataType>[] = [];
  if (requests.length) {
    const annotationsPerBatch = Promise.all(requests);
    const responses = from(annotationsPerBatch).pipe(
      mergeMap((request) => from(request)),
      map((annotations) =>
        convertCDFAnnotationToVisionAnnotations(annotations.items)
      ),
      reduce((allAnnotations, annotationsPerFile) => {
        return allAnnotations.concat(annotationsPerFile);
      })
    );
    visionAnnotations = await lastValueFrom(responses);
  }

  return visionAnnotations;
});
