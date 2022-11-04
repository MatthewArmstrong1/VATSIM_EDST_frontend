import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { zStackSelector } from "~redux/slices/appSlice";
import { FloatingWindowRow } from "styles/floatingWindowStyles";
import { EdstWindow } from "enums/edstWindow";
import { useMetar } from "api/weatherApi";
import { airportIdSelector, delMetar, metarAirportsSelector } from "~redux/slices/weatherSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";
import { FloatingWindow } from "components/utils/FloatingWindow";

type MetarRowProps = {
  airport: string;
  selected: boolean;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onDelete: () => void;
};
const MetarRow = ({ airport, selected, handleMouseDown, onDelete }: MetarRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.METAR));
  const { data: airportMetar, isFetching } = useMetar(airport);
  const airportId = useRootSelector((state) => airportIdSelector(state, airport));

  useEffect(() => {
    if (!airportMetar && !isFetching) {
      dispatch(delMetar(airport));
    }
  }, [isFetching, airportMetar, dispatch, airport]);

  const zIndex = zStack.indexOf(EdstWindow.METAR);
  const rect = ref.current?.getBoundingClientRect();

  return !airportMetar ? null : (
    <>
      <FloatingWindowRow ref={ref} brightness={windowOptions.brightness} selected={selected} onMouseDown={handleMouseDown}>
        {airportMetar.replace(airport, airportId) ?? "..."}
      </FloatingWindowRow>
      {selected && rect && (
        <FloatingWindowOptionContainer
          parentWidth={rect.width}
          parentPos={rect}
          zIndex={zIndex}
          options={{
            delete: {
              value: `DELETE ${airport}`,
              backgroundColor: "#575757",
              onMouseDown: onDelete,
            },
          }}
        />
      )}
    </>
  );
};

export const MetarWindow = () => {
  const dispatch = useRootDispatch();
  const [selectedAirport, setSelectedAirport] = useState<Nullable<string>>(null);
  const airports = useRootSelector(metarAirportsSelector);

  const [showOptions, setShowOptions] = useState(false);
  const extraOptions = useMemo(
    () => ({
      printAll: { value: "PRINT ALL", backgroundColor: "#000000" },
    }),
    []
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
      setShowOptions(false);
      if (selectedAirport !== airport) {
        setSelectedAirport(airport);
      } else {
        setSelectedAirport(null);
      }
    },
    [selectedAirport]
  );

  const setShowOptionsHandler = (value: boolean) => {
    if (value) {
      setSelectedAirport(null);
    }
    setShowOptions(value);
  };

  return (
    <FloatingWindow
      title="WX"
      optionsHeaderTitle="WX"
      width="40ch"
      window={EdstWindow.METAR}
      extraOptions={extraOptions}
      showOptions={showOptions}
      setShowOptions={setShowOptionsHandler}
    >
      {airports.length > 0 && (
        <>
          {airports.map((airport) => (
            <MetarRow
              key={airport}
              airport={airport}
              selected={selectedAirport === airport}
              handleMouseDown={(event) => handleMouseDown(event, airport)}
              onDelete={() => {
                dispatch(delMetar(airport));
                setSelectedAirport(null);
              }}
            />
          ))}
        </>
      )}
    </FloatingWindow>
  );
};
