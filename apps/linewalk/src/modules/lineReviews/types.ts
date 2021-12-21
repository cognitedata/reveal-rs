export type LineReviewAnnotationStatus = 'UNCHECKED' | 'CHECKED';
export type DateTime = number;
export type Assignee = {
  name: string;
};
export type Comment = {
  text: string;
  user: {
    name: string;
  };
};

// export type DocumentAnnotation = {
//   min: [number, number];
//   max: [number, number];
//   status: LineReviewAnnotationStatus;
//   title: string;
//   description: string;
//   comments: Comment[];
// };

export type DocumentAnnotation = {
  id: string;
  markup: {
    type: 'line' | 'rect';
    min: [number, number];
    max: [number, number];
  }[];
  externalId: string;
  // This references an asset like a valve, reducer etc, or a document like a PDF.
  resource: 'asset' | 'document';
  // Maybe this is what the resource is (?), but would it make sense to specify a `layer` to the
  // annotations? I'm thinking some annotations will be interactible (let's say a pipe) but others
  // will not (e.g. alpha layer on top of parts of the document to highlight the area of interest).
};

export type DocumentConnection = [string, string]; // List of annotation ids to connect

export enum DocumentType {
  PID = 'PID',
  ISO = 'ISO',
}

export type Document = {
  id: string; // Required?
  fileExternalId: string;
  annotations: DocumentAnnotation[];
  type: 'PID' | 'ISO';
};

enum DiscrepancyStatus {
  OPEN = 'OPEN',
  REVIEW = 'REVIEW',
  IGNORED = 'IGNORED',
  RESOLVED = 'RESOLVED',
}

export enum LineReviewStatus {
  OPEN = 'OPEN',
  REVIEWED = 'REVIEWED',
}

type LineReviewDiscrepancy = {
  // 1. Is the annotation id unique? If not, we need the documentId as well (~~ different structure)
  // 2. Should annotationId be an array? i.e. that a discrepancy can link to multiple annotations
  // in different documents (i.e. both a P/ID and Isometric).
  annotationId: string[];
  status: DiscrepancyStatus;
  comments: Comment[];
  description: string;
  updatedAt?: Date;
  createdAt: Date;
};

export type LineReview = {
  id: string;
  name: string;
  documents: Document[];
  discrepancies: LineReviewDiscrepancy[];
  assignees: Assignee[];
  // All lines need to be manually reviewed at this stage, so a lack of discrepancies does not
  // mean that the review is complete.
  status: LineReviewStatus;
};
