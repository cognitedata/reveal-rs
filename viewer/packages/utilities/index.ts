/*!
 * Copyright 2021 Cognite AS
 */

export { traverseDepthFirst } from './src/objectTraversal';
export { transformCameraConfiguration } from './src/transformCameraConfiguration';

export { RandomColors } from './src/RandomColors';
export { CameraConfiguration } from './src/CameraConfiguration';

export { EventTrigger } from './src/events/EventTrigger';
export { InputHandler } from './src/events/InputHandler';
export { PointerEvents } from './src/events/PointerEvents';
export { PointerEventsTarget } from './src/events/PointerEventsTarget';
export { disposeOfAllEventListeners } from './src/events/disposeOfAllEventListeners';
export { getPixelCoordinatesFromEvent } from './src/events/getPixelCoordinatesFromEvent';
export { getWheelEventDelta } from './src/events/getWheelEventDelta';
export {
  DisposedDelegate,
  BeforeSceneRenderedDelegate,
  SceneRenderedDelegate,
  PointerEventDelegate,
  PointerEventData
} from './src/events/types';

export { assertNever } from './src/assertNever';
export { NumericRange } from './src/NumericRange';
export { determinePowerOfTwoDimensions } from './src/determinePowerOfTwoDimensions';
export { IndexSet } from './src/IndexSet';
export { DynamicDefragmentedBuffer } from './src/datastructures/DynamicDefragmentedBuffer';
export { AttributeDataAccessor } from './src/three/AttributeDataAccessor';
export { AutoDisposeGroup } from './src/three/AutoDisposeGroup';
export { toThreeBox3 } from './src/three/toThreeBox3';
export { fromThreeVector3 } from './src/three/fromThreeVector3';
export { unionBoxes } from './src/three/unionBoxes';
export { determineCurrentDevice, DeviceDescriptor } from './src/device';
export { createRenderTriangle } from './src/three/createFullScreenTriangleGeometry';
export { VariableWidthLine } from './src/three/VariableWidthLine';

export { fitCameraToBoundingBox } from './src/three/fitCameraToBoundingBox';
export { isBox3OnPositiveSideOfPlane } from './src/three/isBox3OnPositiveSideOfPlane';
export { visitBox3CornerPoints } from './src/three/visitBox3CornerPoints';
export { createDistinctColors } from './src/three/createDistinctColors';
export { isMobileOrTablet } from './src/isMobileOrTablet';
export { WebGLRendererStateHelper } from './src/WebGLRendererStateHelper';

export { TypedArray, TypedArrayConstructor } from './src/types';

export { MemoryRequestCache } from './src/cache/MemoryRequestCache';
export { MostFrequentlyUsedCache } from './src/cache/MostFrequentlyUsedCache';

export { disposeAttributeArrayOnUpload } from './src/disposeAttributeArrayOnUpload';

export { incrementOrInsertIndex, decrementOrDeleteIndex } from './src/counterMap';
export { calculateVolumeOfMesh } from './src/calculateVolumeOfMesh';

export { getApproximateProjectedBounds, getScreenArea } from './src/projectedBounds';

export {
  worldToNormalizedViewportCoordinates,
  worldToViewportCoordinates,
  getNormalizedPixelCoordinatesBySize,
  getNormalizedPixelCoordinates
} from './src/worldToViewport';

export { Line2 } from './src/three/lines/Line2';
export { LineGeometry } from './src/three/lines/LineGeometry';
export { LineMaterial } from './src/three/lines/LineMaterial';

export { DeferredPromise } from './src/DeferredPromise';

export { SceneHandler } from './src/SceneHandler';

export { CustomObject } from './src/customObject/CustomObject';
export { ICustomObject } from './src/customObject/ICustomObject';
export { CustomObjectIntersectInput } from './src/customObject/CustomObjectIntersectInput';
export { CustomObjectIntersection } from './src/customObject/CustomObjectIntersection';
export { Vector3Pool } from './src/three/Vector3Pool';
export { ClosestGeometryFinder } from './src/ClosestGeometryFinder';

export { isPointVisibleByPlanes } from './src/three/isPointVisibleByPlanes';

export { CDF_TO_VIEWER_TRANSFORMATION } from './src/constants';

export * from './src/workers/workerize-transferable';

export * from './src/fdm';

export * from './src/shapes';
export * from './src/linalg';
