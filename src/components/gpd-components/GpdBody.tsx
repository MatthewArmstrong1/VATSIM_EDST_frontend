import React, { createContext, useRef } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import type { AircraftId } from "types/aircraftId";
import type { Coordinate } from "types/gpd/coordinate";
import {
  GPD_MAX_ZOOM,
  GPD_MIN_ZOOM,
  gpdCenterSelector,
  gpdMapFeatureOptionsSelector,
  gpdPlanDataSelector,
  gpdSuppressedSelector,
  gpdZoomLevelSelector,
  setGpdCenter,
  setGpdZoomLevel,
} from "~redux/slices/gpdSlice";
import {
  useArtccBoundaries,
  useTraconMaps,
  useEnabledWhiteLines,
  useEnabledTextLabels,
} from "api/gpdApi";
import gpdStyles from "css/gpd.module.scss";
import * as d3 from "d3";
import { useResizeDetector } from "react-resize-detector";
import { GpdAircraftTrack, GpdRouteLine } from "components/GpdMapElements";
import { useEventListener } from "usehooks-ts";
import { aclEntriesSelector } from "~redux/selectors";
import { useOnUnmount } from "hooks/useOnUnmount";
import { anyDraggingSelector } from "~redux/slices/appSlice";

const initialProjection = d3.geoMercator();

const GpdContext = createContext<d3.GeoProjection>(initialProjection);
export const useGpdContext = () => React.useContext(GpdContext);

export const GpdBody = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeDetector({ targetRef: ref });
  const entryList = useRootSelector(aclEntriesSelector);
  const displayData = useRootSelector(gpdPlanDataSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);
  const initialCenter = useRootSelector(gpdCenterSelector);
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const [showRouteLines, setShowRouteLines] = React.useState<AircraftId[]>([]);
  const [center, setCenter] = React.useState<Coordinate>(initialCenter);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const [dragging, setDragging] = React.useState(false);

  const mapFeatureOptions = useRootSelector(
    (state) => state.gpd.mapFeatureOptions
  );
  const optionsKey = JSON.stringify(mapFeatureOptions); // we need to use this to force a re-render of the GPD when the map features selected by the user changes
  const { data: traconMaps, isSuccess: traconMapsSuccess } =
    useTraconMaps(optionsKey); // Get the map ID of all enabled map features
  const { data: whiteLineMaps, isSuccess: whiteLineMapsSuccess } =
    useEnabledWhiteLines(optionsKey); // Get the map ID of all enabled map features
  const { data: textMaps, isSuccess: textMapsSuccess } =
    useEnabledTextLabels(optionsKey); // Get the map ID of all enabled map features
  const { data: artccBoundaries, isSuccess } = useArtccBoundaries(optionsKey);

  const translate = (
    width && height ? [width / 2, height / 2] : [0, 0]
  ) as Coordinate;

  const projection = initialProjection
    .center(center)
    .translate(translate)
    .scale(zoomLevel);

  const pathGenerator = d3.geoPath(projection);

  useEventListener("mousemove", (e) => {
    if (e.buttons === 1 && dragging && !anyDragging) {
      const newCenter = projection.invert?.([
        translate[0] - e.movementX,
        translate[1] - e.movementY,
      ]);
      if (newCenter) {
        setCenter(newCenter);
      }
    }
  });

  // update the GPD center in redux when the component unmounts
  useOnUnmount(() => {
    dispatch(setGpdCenter(center));
  });

  useEventListener("mouseup", () => {
    if (dragging) {
      setDragging(false);
    }
  });

  const handleMouseDown = () => {
    setDragging(true);
  };

  const wheelHandler: React.WheelEventHandler = (e) => {
    const sign = Math.sign(e.deltaY);
    if ((zoomLevel < GPD_MAX_ZOOM && sign < 0) || (zoomLevel > GPD_MIN_ZOOM && sign > 0)) {
      dispatch(setGpdZoomLevel(zoomLevel - sign * 500));
    }
  };

  const toggleRouteLine = (aircraftId: AircraftId) => {
    const index = showRouteLines.indexOf(aircraftId);
    if (index === -1) {
      setShowRouteLines([...showRouteLines, aircraftId]);
    } else {
      setShowRouteLines(showRouteLines.filter((id) => id !== aircraftId));
    }
  };

  let textMapsComponent: JSX.Element[] = [];
  if (textMapsSuccess && textMaps) {
    textMapsComponent = textMaps
      .flatMap((mapFeature, featureIndex) =>
        mapFeature.features.map((shape, index) => {
          if (shape.geometry.type === "Point" && Array.isArray(shape.geometry.coordinates)) {
            const [lon, lat] = shape.geometry.coordinates;
            const projected = projection([lon, lat]);
            if (!projected) return null;
            const [x, y] = projected;
            // GeoJSON text property is an array, use the first element
            const label = Array.isArray(shape.properties?.text) && shape.properties.text.length > 0 ? shape.properties.text[0] : "";
            return (
              <text
                // eslint-disable-next-line react/no-array-index-key
                key={`${featureIndex}-${index}`}
                x={x}
                y={y + 15}
                fill="#6b6b6b"
                fontSize={12}
                textAnchor="middle"
                alignmentBaseline="middle"
                style={{ pointerEvents: "none" }}
              >
                {label}
              </text>
            );
          }
          return null;
        })
      )
      .filter(Boolean) as JSX.Element[];
  }

  return (
    <div className={gpdStyles.body} ref={ref} onMouseDown={handleMouseDown} onWheel={wheelHandler}>
      <GpdContext.Provider value={projection}>
        <svg width={width} height={height}>
          <g>
            {isSuccess &&
              artccBoundaries.features.map((shape, index) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <path key={index} d={pathGenerator(shape) ?? undefined} fill="none" stroke="#ffffff" strokeWidth={3} />
                );
              })}
            {traconMapsSuccess &&
              traconMaps.map((mapFeature, featureIndex) =>
                mapFeature.features.map((shape, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <path key={`${featureIndex}-${index}`} d={pathGenerator(shape) ?? undefined} fill="none" stroke="#6b6b6b" strokeDasharray="5 3" />
                ))
              )}
            {whiteLineMapsSuccess &&
              whiteLineMaps.map((mapFeature, featureIndex) =>
                mapFeature.features.map((shape, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <path key={`${featureIndex}-${index}`} d={pathGenerator(shape) ?? undefined} fill="none" stroke="#ffffff" strokeWidth={0.5} />
                ))
              )}
            {textMapsSuccess && textMapsComponent}
            {showRouteLines.map((aircraftId) => (
              <GpdRouteLine key={aircraftId} aircraftId={aircraftId} />
            ))}
          </g>
        </svg>
        {!suppressed &&
          entryList.map((entry) => <GpdAircraftTrack key={entry.aircraftId} aircraftId={entry.aircraftId} toggleRouteLine={toggleRouteLine} />)}
      </GpdContext.Provider>
    </div>
  );
};
