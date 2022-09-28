import React, { useState } from "react";
import _ from "lodash";
import { OptionsBodyCol, OptionsBodyRow, OptionsBottomRow, OptionSelectedIndicator, OptionsFlexCol } from "../../../styles/optionMenuStyles";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { EdstButton } from "../../utils/EdstButton";
import { closeWindow } from "../../../redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { gpdMapFeatureOptionsSelector, MapFeatureOption, setGpdMapFeatureOptions } from "../../../redux/slices/gpdSlice";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";

export const GpdMapFeaturesMenu = () => {
  const dispatch = useRootDispatch();
  const mapFeatureOptions = useRootSelector(gpdMapFeatureOptionsSelector);
  const [currentOptions, setCurrentOptions] = useState(_.cloneDeep(mapFeatureOptions));

  return (
    <>
      {Object.values(MapFeatureOption).map(option => {
        return (
          <OptionsBodyRow key={option}>
            <EdstTooltip
              style={{ flexGrow: 1 }}
              onMouseDown={() => setCurrentOptions(prev => ({ ...prev, [option as MapFeatureOption]: !currentOptions[option as MapFeatureOption] }))}
            >
              <OptionsFlexCol>
                <OptionSelectedIndicator selected={currentOptions[option as MapFeatureOption]} />
                {option}
              </OptionsFlexCol>
            </EdstTooltip>
          </OptionsBodyRow>
        );
      })}
      <OptionsBottomRow>
        <OptionsBodyCol>
          <EdstButton
            content="OK"
            onMouseDown={() => {
              // set data when OK is pressed
              dispatch(setGpdMapFeatureOptions(currentOptions));
              dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU));
            }}
          />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight>
          <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU))} />
        </OptionsBodyCol>
      </OptionsBottomRow>
    </>
  );
};
