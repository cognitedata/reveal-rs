import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { TS_FIX_ME } from 'core';
import { MapLayerMouseEvent, MapMouseEvent, Popup } from 'maplibre-gl';

import { log } from '_helpers/log';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  clearSelectedDocument,
  clearSelectedFeature,
  clearSelectedWell,
  setDrawMode,
  setSelectedDocument,
  setSelectedFeature,
  setSelectedWell,
} from 'modules/map/actions';
import { DrawMode } from 'modules/map/types';
import { useMapContext } from 'modules/map/useMapCache';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellIds } from 'modules/wellSearch/selectors';

import {
  DOCUMENT_MARKER,
  GROUPED_CLUSTER_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  WELL_MARKER,
} from '../constants';
import { getAbsoluteCoordinates } from '../utils';

import { useLayers } from './useLayers';

const hoverPopup = new Popup({
  closeButton: false,
  closeOnClick: false,
  className: 'map-hover-popup',
  anchor: 'top',
});

const getHoverPopupCoords = (e: MapLayerMouseEvent): [number, number] => {
  const view: any = e.target.queryRenderedFeatures(e.point, {
    layers: [GROUPED_CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID],
  });
  const coordinates = getAbsoluteCoordinates(
    e.lngLat.lng,
    view[0].geometry.coordinates.slice()
  );

  return [coordinates[0], coordinates[1]];
};

const getHoverPopupOffset = (e: MapLayerMouseEvent): [number, number] => {
  const properties = e.features && e.features[0].properties;
  if (properties) {
    if (!properties.point_count) {
      return [0, 32];
    }
    if (properties.point_count && properties.point_count <= 10) {
      return [0, 38];
    }

    if (properties.point_count > 10 && properties.point_count <= 100) {
      return [0, 46];
    }

    return [0, 60];
  }

  return [0, 0];
};

const getHoverPopupContent = (e: MapLayerMouseEvent) => {
  const properties = e.features && e.features[0].properties;

  if (properties) {
    if (properties.point_count && properties.point_count > 0) {
      if (properties.point_count === properties.wellsCount) {
        return "Wells' cluster";
      }
      if (properties.point_count === properties.documentsCount) {
        return "Documents' cluster";
      }

      return "Wells' & Documents' cluster";
    }
    if (properties.iconType === DOCUMENT_MARKER) {
      return 'Document';
    }
    if (properties.iconType === WELL_MARKER) {
      return 'Well';
    }
  }

  log('Unhandled hover case: ', [properties]);
  return 'No data found';
};

const onMouseEnter = (e: MapLayerMouseEvent) => {
  const canvas = e.target.getCanvas();
  canvas.style.cursor = 'pointer';

  hoverPopup
    .setLngLat(getHoverPopupCoords(e))
    .setOffset(getHoverPopupOffset(e))
    .setHTML(`<div>${getHoverPopupContent(e)}</div>`)
    .addTo(e.target);
};

const onMouseMove = (e: MapLayerMouseEvent) => {
  const canvas = e.target.getCanvas();
  canvas.style.cursor = 'pointer';

  hoverPopup
    .setLngLat(getHoverPopupCoords(e))
    .setOffset(getHoverPopupOffset(e))
    .setHTML(`<div>${getHoverPopupContent(e)}</div>`)
    .addTo(e.target);
};

const onMouseLeave = (e: MapMouseEvent) => {
  const canvas = e.target.getCanvas();
  canvas.style.cursor = '';

  // hide 'tooltip'
  hoverPopup.remove();
};

export const UseMapEvents = () => {
  const metrics = useGlobalMetrics('wells');
  const { layers: mapLayers, layersReady } = useLayers();
  const wellIds = useWellIds();
  const dispatch = useDispatch();
  const [mapSettings, setMapSettings] = useMapContext();

  const clusterZoomOnClickEvent = (e: MapMouseEvent) => {
    const view: any = e.target.queryRenderedFeatures(e.point, {
      layers: [GROUPED_CLUSTER_LAYER_ID],
    });
    if (view && view[0]) {
      const clusterId = view[0].properties.cluster_id;
      (
        e.target.getSource(GROUPED_CLUSTER_LAYER_ID) as any
      ).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;

        e.target.easeTo({
          center: view[0].geometry.coordinates,
          zoom,
        });
      });
    }
  };

  const markerClickEvent = (e: MapMouseEvent) => {
    // prevent bubbling the event to other layers
    const event = e.originalEvent;
    event.cancelBubble = true;

    const view: any = e.target.queryRenderedFeatures(e.point, {
      layers: [UNCLUSTERED_LAYER_ID],
    });

    if (view && view[0]) {
      const coordinates = getAbsoluteCoordinates(
        e.lngLat.lng,
        view[0].geometry.coordinates.slice()
      );

      const { iconType } = view[0].properties;

      if (iconType === DOCUMENT_MARKER) {
        const { documentId } = view[0].properties;

        dispatch(
          setSelectedDocument({
            id: documentId,
            point: { type: 'Point', coordinates },
          })
        );
        dispatch(clearSelectedWell());
      }

      if (iconType === WELL_MARKER) {
        const wellId = view[0]?.properties?.id;

        if (wellId && wellIds.includes(Number(wellId))) {
          dispatch(wellSearchActions.selectWellById(wellId));
        }
        metrics.track('click-open-well-preview-button');
        const coordinates = getAbsoluteCoordinates(
          e.lngLat.lng,
          view[0].geometry.coordinates.slice()
        );
        dispatch(
          setSelectedWell({
            id: wellId,
            point: { type: 'Point', coordinates },
          })
        );
        dispatch(clearSelectedDocument());
      }
    }
  };

  // when the polygon you are drawing changes etc.
  const onSelectionChange = (event: TS_FIX_ME) => {
    if (event.features.length === 0) {
      dispatch(clearSelectedFeature());
    } else {
      dispatch(setSelectedFeature(event.features[0]));
    }
  };

  // Close previewed document cards on map move
  const handleMouseDown = () => {
    dispatch(clearSelectedDocument());
  };

  const handleMovedEnd = (event: MapMouseEvent) => {
    // is this necessary now that we've always displaying the map?
    const center = event.target.getCenter();
    const zoom = event.target.getZoom();

    // used the 'if' here because we had to import mapSettings from the context
    // const [, setMapSettings] = useMapContext();
    // was giving lint errors
    if (mapSettings) {
      setMapSettings({
        center,
        zoom,
      });
    }
  };

  const events = useMemo(
    () => [
      // Cluster

      {
        type: 'mouseleave',
        layer: GROUPED_CLUSTER_LAYER_ID,
        callback: onMouseLeave,
      },
      {
        type: 'click',
        layer: GROUPED_CLUSTER_LAYER_ID,
        callback: clusterZoomOnClickEvent,
      },
      // NOTE: we use mousemove instead of mouseenter because the enter event is not triggered when clusters are close and we move from one to other
      {
        type: 'mousemove',
        layer: GROUPED_CLUSTER_LAYER_ID,
        callback: (e: any) => {
          onMouseMove(e);
        },
      },

      // Marker

      {
        type: 'mouseenter',
        layer: UNCLUSTERED_LAYER_ID,
        callback: onMouseEnter,
      },
      {
        type: 'mouseleave',
        layer: UNCLUSTERED_LAYER_ID,
        callback: onMouseLeave,
      },

      {
        type: 'click',
        layer: UNCLUSTERED_LAYER_ID,
        callback: markerClickEvent,
      },

      // Map

      {
        type: 'mousedown',
        callback: handleMouseDown,
      },
      {
        type: 'moveend',
        callback: handleMovedEnd,
      },
      {
        type: 'draw.selectionchange',
        callback: onSelectionChange,
      },
      {
        type: 'draw.modechange',
        callback: (event: { mode: DrawMode; type: string }) => {
          dispatch(setDrawMode(event.mode));
        },
      },
      {
        type: 'zoom',
        callback: () => {
          hoverPopup.remove();
        },
      },
    ],
    [wellIds, mapLayers, layersReady]
  );

  return events;
};
