import React, { useState } from 'react';
import styled from 'styled-components';

import ReactMapboxGl, { Layer, Feature, Popup } from 'react-mapbox-gl';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectAllFiles } from 'src/modules/Common/filesSlice';
import { FileInfo } from '@cognite/sdk';
import * as MapboxGL from 'mapbox-gl';
import { TableDataItem } from 'src/modules/Common/types';
import { MAPBOX_TOKEN, MAPBOX_MAP_ID } from './constants';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopup } from './MapPopup';

const Mapbox = ReactMapboxGl({
  minZoom: 1,
  maxZoom: 30,
  accessToken: MAPBOX_TOKEN,
  attributionControl: false,
});

export const MapView = (props: { data?: TableDataItem[] }) => {
  const [selectedFile, setSelectedFile] = useState<FileInfo>();
  const [center, setCenter] = useState<[number, number]>();
  const [zoom] = useState<[number] | undefined>([2]);

  const fitBounds = undefined; // TODO: calculate this based on the provided data

  // TODO: Use a more appropriate state than uploadedFiles when created
  const selectedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice).filter((item) =>
      props.data?.map((f) => f.id).includes(item.id)
    )
  );

  const handleStyleLoad = (map: MapboxGL.Map) => map.resize();

  const mapStyle = {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };

  const flyToOptions = {
    speed: 0.8,
  };

  const circleLayout: MapboxGL.CircleLayout = { visibility: 'visible' };
  const circlePaint: MapboxGL.CirclePaint = {
    'circle-color': '#C844DB',
    'circle-radius': 7.5,
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
    'circle-color-transition': { duration: 0 },
  };

  const features = Object.assign(
    {},
    ...selectedFiles
      .filter((f) => f.geoLocation && f)
      .map((s) => ({
        [s.id]: s.geoLocation?.geometry.coordinates as [number, number],
      }))
  );

  const handleOnDrag = () => {
    if (selectedFile) setSelectedFile(undefined);
  };

  return (
    <Container>
      <Mapbox
        style={MAPBOX_MAP_ID}
        onStyleLoad={handleStyleLoad}
        fitBounds={fitBounds}
        center={center}
        zoom={zoom}
        containerStyle={mapStyle}
        flyToOptions={flyToOptions}
        onDrag={handleOnDrag}
        onClick={handleOnDrag}
      >
        <Layer type="circle" layout={circleLayout} paint={circlePaint}>
          {Object.keys(features).map((f, _) => (
            <Feature
              key={f}
              coordinates={features[f]}
              onClick={() => {
                setSelectedFile(
                  selectedFiles.find((file) => file.id.toString() === f)
                );
                setCenter(features[f]);
              }}
            />
          ))}
        </Layer>
        {selectedFile ? (
          <Popup
            key={selectedFile.id}
            coordinates={features[selectedFile.id.toString()]}
            anchor="bottom"
            offset={[0, -10]}
            style={{
              position: 'fixed',
            }}
          >
            <MapPopup
              item={props?.data?.find(
                (element) => element.id === selectedFile.id
              )}
            />
          </Popup>
        ) : (
          <div />
        )}
      </Mapbox>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
