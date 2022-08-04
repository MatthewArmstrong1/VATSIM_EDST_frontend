/* eslint-disable no-console */
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { HttpTransportType, HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { decodeJwt } from "jose";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { clearSession, nasTokenSelector, setSession, vatsimTokenSelector } from "../redux/slices/authSlice";
import { refreshToken } from "../api/vNasDataApi";
import { initThunk } from "../redux/thunks/initThunk";
import { setArtccId, setSectorId } from "../redux/slices/sectorSlice";
import { ApiFlightplan } from "../types/apiTypes/apiFlightplan";
import { ApiAircraftTrack } from "../types/apiTypes/apiAircraftTrack";
import { ApiSessionInfo } from "../types/apiTypes/apiSessionInfo";
import { ApiTopic } from "../types/apiTypes/apiTopic";
import { updateAircraftTrackThunk } from "../redux/thunks/updateAircraftTrackThunk";
import { updateFlightplanThunk } from "../redux/thunks/updateFlightplanThunk";
import { log } from "../console";
import { setMcaResponseString } from "../redux/slices/appSlice";

const ATC_SERVER_URL = process.env.REACT_APP_ATC_HUB_URL;

const useHubInit = () => {
  const [, setHubConnected] = useState(false);
  const dispatch = useRootDispatch();
  const nasToken = useRootSelector(nasTokenSelector)!;
  const vatsimToken = useRootSelector(vatsimTokenSelector)!;
  const ref = useRef<{ hubConnection: HubConnection | null }>({ hubConnection: null });

  const getValidNasToken = () => {
    const decodedToken = decodeJwt(nasToken);
    if (decodedToken.exp! - Math.trunc(Date.now() / 1000) < 0) {
      console.log("Refreshed NAS token");
      return refreshToken(vatsimToken).then(r => {
        return r.data;
      });
    }
    return nasToken;
  };

  useEffect(() => {
    if (!ATC_SERVER_URL || !nasToken) {
      return;
    }
    const hubConnection = new HubConnectionBuilder()
      .withUrl(ATC_SERVER_URL, {
        accessTokenFactory: getValidNasToken,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true
      })
      .withAutomaticReconnect()
      .build();

    async function start() {
      hubConnection.onclose(() => {
        log("ATC hub disconnected");
      });

      hubConnection.on("HandleSessionStarted", (sessionInfo: ApiSessionInfo) => {
        log(sessionInfo);
        dispatch(setSession(sessionInfo));
      });

      hubConnection.on("HandleSessionEnded", () => {
        log("clearing session");
        dispatch(clearSession());
      });
      hubConnection.on("receiveFlightplan", (topic: ApiTopic, flightplan: ApiFlightplan) => {
        log("received flightplan:", flightplan);
        dispatch(updateFlightplanThunk(flightplan));
      });
      hubConnection.on("receiveAircraft", (aircraft: ApiAircraftTrack[]) => {
        // log("received aircraft:", aircraft);
        aircraft.forEach(t => {
          dispatch(updateAircraftTrackThunk(t));
        });
      });

      hubConnection.on("receiveError", (message: string) => {
        dispatch(setMcaResponseString(message));
      });

      hubConnection
        .start()
        .then(() => {
          hubConnection
            .invoke<ApiSessionInfo>("getSessionInfo")
            .then(sessionInfo => {
              log(sessionInfo);
              if (sessionInfo.position.eramConfiguration) {
                const { artccId } = sessionInfo;
                const { sectorId } = sessionInfo.position.eramConfiguration;
                dispatch(setArtccId(artccId));
                dispatch(setSectorId(sectorId));
                dispatch(setSession(sessionInfo));
                dispatch(initThunk());
                hubConnection
                  .invoke<void>("joinSession", { sessionId: sessionInfo.id })
                  .then(() => {
                    log(`joined session ${sessionInfo.id}`);
                    hubConnection
                      .invoke<void>("subscribe", new ApiTopic("FlightPlans", sessionInfo.facilityId))
                      .then(() => log("subscribe succeeded."))
                      .catch(console.log);
                  })
                  .catch(console.log);
              } else {
                console.log("not signed in to a Center position");
              }
            })
            .catch(() => {
              console.log("No session found");
            });
          setHubConnected(true);
          console.log("Connected to ATC hub");
        })
        .catch(e => {
          console.error("Error starting connection: ", e);
        });
    }

    hubConnection.keepAliveIntervalInMilliseconds = 1000;
    ref.current.hubConnection = hubConnection;

    start().then();
  }, []);

  return ref.current.hubConnection;
};

type HubContextValue = ReturnType<typeof useHubInit>;

const HubContext = createContext<HubContextValue>(null);

export const HubProvider = ({ children }: { children: ReactNode }) => {
  const hubConnection = useHubInit();
  log(hubConnection);

  return <HubContext.Provider value={hubConnection}>{children}</HubContext.Provider>;
};

export const useHub = () => {
  return useContext(HubContext);
};
/* eslint-enable no-console */
