import styled from "styled-components";
import { edstFontGreen, edstFontYellow } from "../../../styles/colors";
import { Col } from "../../../styles/sharedColumns";

export const AclCol1 = styled(Col)<{ border?: boolean }>`
  margin: 0 2px;
  width: 14px;
  ${props =>
    props.border && {
      outline: "1px solid #ADADAD"
    }};
`;
export const RadioCol = styled(AclCol1)<{ hoverGreen?: boolean; header?: boolean }>`
  width: 10px;

  &:hover {
    border: 1px solid ${props => (props.hoverGreen ? edstFontGreen : "#F0F0F0")};
  }

  ${props =>
    props.header && {
      "font-size": "14px",
      margin: "0 2px",
      width: "10px",
      "pointer-events": "none"
    }};
`;
export const SpecialBox = styled(Col)`
  margin: 0 2px;
  width: 8px;

  &:hover {
    border: 1px solid #f0f0f0;
  }

  ${props =>
    props.selected && {
      "background-color": "#ADADAD",
      color: "#000000"
    }};
`;
export const CoralBox = styled(SpecialBox)`
  margin: 0 2px;
  width: 8px;
  height: 100%;
  border: 1px solid #d698a5;
  pointer-events: none;
`;
export const RemarksBox = styled(SpecialBox)<{ unchecked?: boolean }>(props => {
  return (
    props.unchecked && {
      color: edstFontYellow,
      border: `1px solid ${edstFontYellow}`
    }
  );
});
export const VoiceTypeSpan = styled.span`
  color: #989898;
`;
export const PointOutCol = styled(Col)`
  width: 30px;
  justify-content: left;
`;
export const AltCol = styled(Col)<{ headerCol?: boolean }>`
  display: flex;
  justify-content: left;
  width: 70px;
  margin-right: 8px;

  ${props =>
    props.headerCol && {
      width: "55px",
      "margin-right": "19px",
      "padding-left": "4px"
    }}
`;
export const AltColDiv = styled(Col)<{ headerMouseDown?: boolean }>`
  border: 1px solid transparent;

  ${props => props.headerMouseDown && { border: "1px solid #AD3636" }};
  &:hover {
    border: 1px solid #f0f0f0;
  }
`;
export const HdgCol = styled(Col)<{ scratchpad?: boolean }>`
  width: 38px;
  margin: 0;
  justify-content: right;
  padding-right: 1px;
  ${props => props.scratchpad && { color: edstFontYellow }}
  ${props =>
    props.selected && {
      color: "#000000",
      "background-color": props.scratchpad ? edstFontYellow : "#ADADAD"
    }};
  ${props => props.contentHidden && { visibility: "hidden" }};
  ${props => (props.contentHidden || props.hidden) && { width: "20px" }};
`;
export const HdgSpdSlashCol = styled(Col)`
  width: 10px;
  margin: 0;
`;
export const SpdCol = styled(Col)<{ scratchpad?: boolean }>`
  width: 38px;
  margin: 0;
  justify-content: left;
  padding-left: 1px;
  ${props => props.scratchpad && { color: edstFontYellow }}
  ${props =>
    props.selected && {
      color: "#000000",
      "background-color": props.scratchpad ? edstFontYellow : "#ADADAD"
    }};
  ${props => props.contentHidden && { visibility: "hidden" }};
  ${props => (props.contentHidden || props.hidden) && { width: "20px" }};
`;
