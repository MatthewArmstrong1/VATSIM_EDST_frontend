import {Time} from "./Time";
import {Tooltips} from "../tooltips";
import {EdstTooltip} from "./resources/EdstTooltip";
import React from "react";
import {useRootDispatch, useRootSelector} from '../redux/hooks';
import {edstHeaderButtonEnum, windowEnum} from "../enums";
import {disabledHeaderButtonsSelector, openWindow, toggleWindow, windowsSelector} from "../redux/slices/appSlice";
import {planQueueSelector} from "../redux/slices/planSlice";
import {sigmetSelector} from "../redux/slices/weatherSlice";
import styled from "styled-components";
import {edstFontGrey} from "../styles/colors";
import {sectorIdSelector} from "../redux/slices/sectorSlice";
import {entriesSelector} from "../redux/slices/entriesSlice";

const YELLOW = "#A3A300";
// const RED = "#590000";

const EdstHeaderDiv = styled.div`
  width: 100vw;
  position: absolute;
`;

const EdstHeaderRow = styled.div`
  z-index: 20001;
  height: 30px;
  margin: 2px 0;
  justify-content: space-between;
  display: flex;
`;

const EdstHeaderCol = styled.div<{ bottomRow?: boolean }>`
  z-index: 20001;
  margin: 1px 1px;
  display: inline-flex;
  ${props => props.bottomRow && {"margin-left": '73px'}};

  span {
    display: inline-flex;
  }
`;

const ColButton = styled.button<{ width?: number, height?: number, open?: boolean, fontWeight?: string, backgroundColor?: string, borderColor?: string }>`
  display: flex;
  justify-content: center;
  line-height: 13px;
  font-size: 13px;
  width: ${props => props.width ? props.width + "px" : "70px"};
  height: ${props => props.height ? props.height + "px" : "30px"};
  margin: 0 1px;
  border: 1px solid #ADADAD;
  background-color: ${props => props.backgroundColor ?? "#000000"};
  color: ${props => props.color ?? edstFontGrey};
  font-weight: ${props => props.fontWeight ?? 'bolder'};

  &:hover {
    border: 1px solid #FFFFFF;
  }

  &:disabled {
    border: 1px solid #707070;
    color: #707070;
  }

  ${props => props.borderColor && {
    border: `1px solid ${props.borderColor}`
  }}
  ${props => props.open && {
    "background-color": "#595959"
  }}
`;

type EdstHeaderButtonProps = {
  title?: string,
  width?: number,
  open: boolean,
  backgroundColor?: string
  borderColor?: string,
  color?: string,
  disabled?: boolean,
  content?: string,
  onMouseDown?: () => void
}

const EdstHeaderButton: React.FC<EdstHeaderButtonProps> = ({title, content, ...props}) => (<EdstTooltip title={title}>
  <ColButton
    {...props}
    open={props.open}
    width={props.width}
    disabled={props.disabled}
    onMouseDown={props.onMouseDown}
  >
    {content}
  </ColButton>
</EdstTooltip>);
const EdstHeaderButton50: React.FC<EdstHeaderButtonProps> = (props) => <EdstHeaderButton width={50} {...props}/>;


export const EdstHeader: React.FC = () => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const windows = useRootSelector(windowsSelector);
  const disabledHeaderButtons = useRootSelector(disabledHeaderButtonsSelector);

  const sectorId = useRootSelector(sectorIdSelector);
  const entries = useRootSelector(entriesSelector);
  const aclLen = Object.values(entries).filter(entry => entry.aclDisplay).length;
  const depLen = Object.values(entries).filter(entry => entry.depDisplay).length;
  const sigmets = useRootSelector(sigmetSelector);
  const sigLen = Object.values(sigmets).filter(sigmetEntry => !sigmetEntry.acknowledged).length;
  const notLen = 0, giLen = 0;

  return (
    <EdstHeaderDiv>
      <EdstHeaderRow>
        <EdstHeaderCol>
          <ColButton width={18} fontWeight="normal" disabled={true}>
            {'\u{1F873}'}
          </ColButton>
          <ColButton width={50} open={windows[windowEnum.more].open}
                     disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.more)}
                     onMouseDown={() => dispatch(toggleWindow(windowEnum.more))}
          >
            MORE
          </ColButton>
          <EdstHeaderButton open={windows[windowEnum.acl].open}
                            content={`ACL ${aclLen.toString().padStart(2, '0')}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.acl)}
                            title={Tooltips.acl}
                            onMouseDown={() => dispatch(openWindow({window: windowEnum.acl}))}
          />
          <EdstHeaderButton open={windows[windowEnum.dep].open}
                            content={`DEP ${depLen.toString().padStart(2, '0')}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.dep)}
                            title={Tooltips.dep}
                            onMouseDown={() => dispatch(openWindow({window: windowEnum.dep}))}
          />
          <EdstHeaderButton open={windows[windowEnum.graphicPlanDisplay].open}
                            content="GPD"
                            disabled={process.env.NODE_ENV !== 'development'}
            // title={Tooltips.gpd}
                            onMouseDown={() => dispatch(openWindow({window: windowEnum.graphicPlanDisplay}))}
          />
          <EdstHeaderButton open={windows[windowEnum.plansDisplay].open}
                            content="PLANS"
                            disabled={planQueue.length === 0}
                            title={Tooltips.plans}
                            onMouseDown={() => dispatch(openWindow({window: windowEnum.plansDisplay}))}
          />
          <EdstHeaderButton open={windows[windowEnum.metar].open}
                            content="WX REPORT"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.wx)}
            // title={Tooltips.wx}
                            onMouseDown={() => dispatch(toggleWindow(windowEnum.metar))}
          />
          <EdstHeaderButton open={windows[windowEnum.sigmets].open}
                            borderColor={sigLen > 0 ? YELLOW : undefined}
                            color={sigLen > 0 ? YELLOW : undefined}
                            content={`SIG ${sigLen > 0 ? sigLen.toString().padStart(2, '0') : '✓'}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.sig)}
            // title={Tooltips.sig}
                            onMouseDown={() => dispatch(toggleWindow(windowEnum.sigmets))}
          />
          <EdstHeaderButton open={windows[windowEnum.notams].open}
                            content={`NOT ${notLen > 0 ? notLen.toString().padStart(2, '0') : ''}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.not)}
            // title={Tooltips.not}
                            onMouseDown={() => dispatch(toggleWindow(windowEnum.notams))}
          />
          <EdstHeaderButton open={windows[windowEnum.generalInfo].open}
                            content={`GI ${giLen > 0 ? giLen.toString().padStart(2, '0') : ''}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.gi)}
            // title={Tooltips.gi}
                            onMouseDown={() => dispatch(toggleWindow(windowEnum.generalInfo))}
          />
          <EdstHeaderButton open={windows[windowEnum.ua].open}
                            content="UA"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.ua)}
            // title={Tooltips.ua}
                            onMouseDown={() => dispatch(toggleWindow(windowEnum.ua))}
          />
          <EdstHeaderButton open={false}
                            content="KEEP ALL"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.keep)}
            // title={Tooltips.keep}
            // onMouseDown={() => props.toggleWindow('keep')}
          />
        </EdstHeaderCol>
        <EdstHeaderCol>
          <EdstHeaderButton open={windows[windowEnum.status].open}
                            content="STATUS ACTIVE"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.status)}
                            title={Tooltips.statusActive}
                            onMouseDown={() => dispatch(toggleWindow(windowEnum.status))}
          />
          <EdstHeaderButton open={windows[windowEnum.outage].open}
                            content={`OUTAGE ${sectorId}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.outage)}
                            title={Tooltips.statusOutage}
                            onMouseDown={() => dispatch(toggleWindow(windowEnum.outage))}
          />
          <Time/>
          <EdstHeaderButton50 open={windows[windowEnum.adsb].open}
                              content="NON-ADSB"
                              disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.adsb)}
            // title={Tooltips.adsb}
                              onMouseDown={() => dispatch(toggleWindow(windowEnum.adsb))}
          />
          <EdstHeaderButton50 open={windows[windowEnum.sat].open}
                              content="SAT COMM"
                              disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.sat)}
            // title={Tooltips.sat}
                              onMouseDown={() => dispatch(toggleWindow(windowEnum.sat))}
          />
          <EdstHeaderButton50 open={windows[windowEnum.msg].open}
            // backgroundColor={YELLOW}
            // borderColor={YELLOW}
                              content="MSG WAIT"
                              disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.msg)}
            // title={Tooltips.msg}
                              onMouseDown={() => dispatch(toggleWindow(windowEnum.msg))}
          />
        </EdstHeaderCol>
      </EdstHeaderRow>
      {windows[windowEnum.more].open && <EdstHeaderRow>
          <EdstHeaderCol bottomRow={true}>
              <EdstHeaderButton open={windows[windowEnum.wind].open}
                                content="WIND"
                                disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.wind)}
                // title={Tooltips.wind}
                                onMouseDown={() => dispatch(toggleWindow(windowEnum.wind))}
              />
              <EdstHeaderButton open={windows[windowEnum.altimeter].open}
                                content="ALTIM SET"
                                disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.altim)}
                // title={Tooltips.alt}
                                onMouseDown={() => dispatch(toggleWindow(windowEnum.altimeter))}
              />
              <EdstHeaderButton open={windows[windowEnum.messageComposeArea].open}
                                content="MCA"
                                disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.mca)}
                                title={Tooltips.mca}
                                onMouseDown={() => dispatch(toggleWindow(windowEnum.messageComposeArea))}
              />
              <EdstHeaderButton open={windows[windowEnum.messageResponseArea].open}
                                content="RA"
                                disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.mra)}
                                title={Tooltips.ra}
                                onMouseDown={() => dispatch(toggleWindow(windowEnum.messageResponseArea))}
              />
              <EdstHeaderButton open={windows[windowEnum.fel].open}
                                content="FEL"
                                disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.fel)}
                // title={Tooltips.fel}
                                onMouseDown={() => dispatch(toggleWindow(windowEnum.fel))}
              />
              <EdstHeaderButton open={windows[windowEnum.cpdlcHist].open}
                                backgroundColor={YELLOW}
                                borderColor={YELLOW}
                                content="CPDLC HIST"
                                disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.cpdlcHist)}
                // title={Tooltips.cpdlc_hist}
                                onMouseDown={() => dispatch(toggleWindow(windowEnum.cpdlcHist))}
              />
              <EdstHeaderButton open={windows[windowEnum.cpdlcMsgOut].open}
                                backgroundColor={YELLOW}
                                borderColor={YELLOW}
                                content="CPDLC MSGOUT"
                                disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.cpdlcMsgOut)}
                // title={Tooltips.cpdlc_msg_out}
                                onMouseDown={() => dispatch(toggleWindow(windowEnum.cpdlcMsgOut))}
              />
          </EdstHeaderCol>
      </EdstHeaderRow>}
    </EdstHeaderDiv>
  );
};