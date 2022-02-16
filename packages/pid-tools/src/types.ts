import { orientations, symbolTypes } from './constants';

export interface SvgPath {
  svgCommands: string;
}

export interface SvgPathWithId extends SvgPath {
  id: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SvgRepresentation {
  svgPaths: SvgPath[];
  boundingBox: Rect;
}

interface EquipmentTagInfo {
  equipmentTag: string;
}

export type SymbolType = typeof symbolTypes[number];

export interface DiagramSymbol {
  id: string; // uuid
  symbolType: SymbolType;
  description: string;
  svgRepresentations: SvgRepresentation[];
  orientation?: Orientation;
}

export type DiagramType = SymbolType | 'Line' | 'EquipmentTag';

export interface DiagramInstance {
  id: string;
  type: DiagramType;
  labelIds: string[];
  assetExternalId?: string;
  lineNumbers: number[];
  inferedLineNumbers: number[];
}

export interface DiagramInstanceWithPaths extends DiagramInstance {
  pathIds: string[];
}

export interface DiagramLineInstance extends DiagramInstanceWithPaths {
  type: 'Line';
}

export interface DiagramSymbolInstance extends DiagramInstanceWithPaths {
  type: SymbolType;
  symbolId: string;
  scale?: number;
}

export type Orientation = typeof orientations[number];

export type FileDirection = 'In' | 'Out' | 'Unidirectional' | 'Unknown';

export interface FileConnectionInstance extends DiagramSymbolInstance {
  type: 'File connection';
  position?: string; // 'A5', 'B3' or similar
  toPosition?: string;
  documentNumber?: number; // points to `PidDocumentMetadata.documentNumber`
  unit?: string; // // points to `DocumentMetadata.unit`
  orientation: Orientation;
  fileDirection?: FileDirection;
}

export interface LineConnectionInstance extends DiagramSymbolInstance {
  type: 'Line connection';
  letterIndex?: string; // A/B/C
  pointsToFileName?: string; // point to IsoDocumentMetadata.lineNumber or 'SAME' if on the same document
}

export interface DiagramEquipmentInstance
  extends DiagramSymbolInstance,
    EquipmentTagInfo {
  type: 'Equipment';
}

export interface DiagramEquipmentTagInstance
  extends DiagramInstance,
    EquipmentTagInfo {
  type: 'EquipmentTag';
}

export interface PathReplacement {
  pathId: string;
  replacementPaths: SvgPathWithId[];
}

export type DiagramInstanceId = string;

export interface DiagramConnection {
  start: DiagramInstanceId;
  end: DiagramInstanceId;
  direction: 'directed' | 'unknown';
}

interface DiagramInstanceOutputFields {
  svgRepresentation: SvgRepresentation;
  labels: DiagramLabelOutputFormat[];
}

export type DiagramSymbolInstanceOutputFormat = DiagramSymbolInstance &
  DiagramInstanceOutputFields;

export type DiagramLineInstanceOutputFormat = DiagramLineInstance &
  DiagramInstanceOutputFields;

export type DiagramEquipmentInstanceOutputFormat = DiagramEquipmentInstance &
  DiagramInstanceOutputFields;

export type DiagramEquipmentTagInstanceOutputFormat =
  DiagramEquipmentTagInstance & DiagramInstanceOutputFields;

export interface DiagramLabelOutputFormat {
  id: string;
  text: string;
  boundingBox: Rect;
}

export enum DocumentType {
  pid = 'P&ID',
  isometric = 'Isometric',
  unknown = 'Unknown',
}

export interface GraphDocument {
  documentMetadata: DocumentMetadata;
  viewBox: Rect;
  symbols: DiagramSymbol[];
  symbolInstances: DiagramSymbolInstanceOutputFormat[];
  lines: DiagramLineInstanceOutputFormat[];
  connections: DiagramConnection[];
  pathReplacements: PathReplacement[];
  lineNumbers: number[];
  equipmentTags: DiagramEquipmentTagInstanceOutputFormat[];
  labels: DiagramLabelOutputFormat[];
}

interface DocumentMetadataBase {
  type: DocumentType;
  name: string;
  unit: string;
}

export interface PidDocumentMetadata extends DocumentMetadataBase {
  type: DocumentType.pid;
  documentNumber: number; // i.e MF_34, MF_034 -> 34
}

export interface IsoDocumentMetadata extends DocumentMetadataBase {
  type: DocumentType.isometric;
  lineNumber: number; // i.e 32, 132, L132-1 -> 132
  pageNumber: number; // i.e. L132-1 -> 1
}

export interface UnknownDocumentMetadata extends DocumentMetadataBase {
  type: DocumentType.unknown;
}

export type DocumentMetadata =
  | PidDocumentMetadata
  | IsoDocumentMetadata
  | UnknownDocumentMetadata;
