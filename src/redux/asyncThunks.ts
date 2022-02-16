import {fetchBoundaryData, fetchReferenceFixes, updateEdstEntry} from "../api";
import {RootState} from "./store";
import {setArtccId, setReferenceFixes, setSectorId, setSectors} from "./slices/sectorSlice";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {refreshEntriesThunk, setEntry} from "./slices/entriesSlice";
import {refreshEntry} from "./refresh";

export const initThunk = createAsyncThunk(
  'app/init',
  async (_args, thunkAPI) => {
    let state = thunkAPI.getState() as RootState;
    let artccId: string;
    let sectorId: string;
    if (process.env.NODE_ENV === 'development') {
      artccId = 'zbw';
      // artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    } else {
      artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    }
    thunkAPI.dispatch(setArtccId(artccId));
    thunkAPI.dispatch(setSectorId(sectorId));
    if (Object.keys(state.sectorData.sectors).length === 0) {
      await fetchBoundaryData(artccId)
        .then(response => response.json())
        .then(sectors => {
          thunkAPI.dispatch(setSectors(sectors));
        });
    }
    state = thunkAPI.getState() as RootState;
    // if we have no reference fixes for computing FRD, get some
    if (!(state.sectorData.referenceFixes.length > 0)) {
      await fetchReferenceFixes(artccId)
        .then(response => response.json())
        .then(referenceFixes => {
          if (referenceFixes) {
            thunkAPI.dispatch(setReferenceFixes(referenceFixes));
          }
        });
    }
    return thunkAPI.dispatch(refreshEntriesThunk());
  }
);

export const amendEntryThunk = createAsyncThunk(
  'entries/amend',
  async ({cid, planData}: { cid: string, planData: any }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const {cidList: depCidList} = state.dep;
    let currentEntry = state.entries[cid];
    if (Object.keys(planData).includes('altitude')) {
      planData.interim = null;
    }
    if (Object.keys(planData).includes('route')) {
      const dest = currentEntry.dest;
      if (planData.route.slice(-dest.length) === dest) {
        planData.route = planData.route.slice(0, -dest.length);
      }
      planData.previous_route = depCidList.includes(cid) ? currentEntry?.route : currentEntry?._route;
      planData.previous_route_data = depCidList.includes(cid) ? currentEntry?.route_data : currentEntry?._route_data;
    }
    planData.callsign = currentEntry.callsign;
    console.log(planData);
    return updateEdstEntry(planData)
      .then(response => response.json())
      .then(updatedEntry => {
        if (updatedEntry) {
          updatedEntry = refreshEntry(updatedEntry, state);
          updatedEntry.pending_removal = null;
          if (planData.scratch_hdg !== undefined) updatedEntry.scratch_hdg = planData.scratch_hdg;
          if (planData.scratch_spd !== undefined) updatedEntry.scratch_spd = planData.scratch_spd;
          thunkAPI.dispatch(setEntry(updatedEntry));
        }
      });
  }
);