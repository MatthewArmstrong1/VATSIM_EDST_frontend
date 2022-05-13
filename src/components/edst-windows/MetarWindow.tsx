import React, {useRef, useState} from 'react';
import {windowEnum} from "../../enums";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {closeWindow, pushZStack, windowPositionSelector, zStackSelector} from "../../redux/slices/appSlice";
import {metarSelector, removeAirportMetar} from "../../redux/slices/weatherSlice";
import {FloatingWindowOptions} from "./FloatingWindowOptions";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock8x2, FloatingWindowHeaderColDivFlex, FloatingWindowHeaderColDiv20,
  FloatingWindowHeaderDiv,
  FloatingWindowRow
} from "../../styles/floatingWindowStyles";
import {useDragging} from "../../hooks";
import {EdstDraggingOutline} from "../../styles/draggingStyles";
import styled from "styled-components";

const MetarDiv = styled(FloatingWindowDiv)`
  width: 400px
`;

export const MetarWindow: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(windowEnum.metar));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number, y: number, w: number } | null>(null);
  const metarList = useRootSelector(metarSelector);
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef(null);
  const {startDrag, stopDrag, dragPreviewStyle} = useDragging(ref, windowEnum.metar);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
    if (selected !== airport) {
      setSelected(airport);
      setSelectedPos({
        x: event.currentTarget.offsetLeft,
        y: event.currentTarget.offsetTop,
        w: event.currentTarget.offsetWidth
      });
    } else {
      setSelected(null);
      setSelectedPos(null);
    }
  }

  return pos && (<MetarDiv
      pos={pos}
      zIndex={zStack.indexOf(windowEnum.metar)}
      onMouseDown={() => zStack.indexOf(windowEnum.metar) > 0 && dispatch(pushZStack(windowEnum.metar))}
      ref={ref}
      id="edst-status"
    >
      {dragPreviewStyle && <EdstDraggingOutline
          style={dragPreviewStyle}
          onMouseDown={stopDrag}
      />}
      <FloatingWindowHeaderDiv>
        <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
        <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>
          WX
        </FloatingWindowHeaderColDivFlex>
        <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(windowEnum.metar))}>
          <FloatingWindowHeaderBlock8x2/>
        </FloatingWindowHeaderColDiv20>
      </FloatingWindowHeaderDiv>
      {Object.values(metarList).length > 0 && <FloatingWindowBodyDiv>
        {Object.entries(metarList).map(([airport, airportMetarEntry]) =>
          <span style={{margin: "6px 0"}} key={`metar-list-key-${airport}`}>
            <FloatingWindowRow
              selected={selected === airport}
              onMouseDown={(event) => handleMouseDown(event, airport)}
            >
              {airportMetarEntry.metar}
            </FloatingWindowRow>
            {selected === airport && selectedPos &&
                <FloatingWindowOptions
                    pos={{
                      x: selectedPos.x + selectedPos.w,
                      y: selectedPos.y
                    }}
                    options={[`DELETE ${airport}`]}
                    handleOptionClick={() => {
                      dispatch(removeAirportMetar(airport));
                      setSelected(null);
                      setSelectedPos(null);
                    }}
                />}
          </span>)}
      </FloatingWindowBodyDiv>}
    </MetarDiv>
  );
};
