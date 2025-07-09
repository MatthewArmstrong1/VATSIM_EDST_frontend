/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { E } from "@tauri-apps/api/path-e12e0e34";
import { feature } from "@turf/turf";
import type { FeatureCollection } from "geojson";

const baseUrl = import.meta.env.VITE_BACKEND_BASEURL!;

// Define a service using a base URL and expected endpoints
export const gpdApi = createApi({
  reducerPath: "gpdApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getArtccBoundaries: builder.query<FeatureCollection, string>({
      queryFn: async (_, { getState }) => {
        // we cannot put RootState here because then gpdApi would reference itself
        const state = getState() as any;
        let featureCollection: FeatureCollection | null = null;
        if (state.gpd.mapFeatureOptions["Center Boundaries"]) {
          const url = (getState() as any).auth.vnasConfiguration.artccBoundariesUrl;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("could not fetch ARTCC boundaries");
          }
          featureCollection = await response.json();
        }

        if (featureCollection) {
          return { data: featureCollection };
        } else {
          // Return an empty FeatureCollection if not enabled due to bad config
          return { data: { type: "FeatureCollection", features: [] } };
        }
      },
    }),
    getTraconMaps: builder.query<FeatureCollection[], string>({
      queryFn: async (_, { getState }) => {
        const state = getState() as any;
        const ARTCC = state.auth.session.artccId;
        const mapIds = [];
        if (state.gpd.mapFeatureOptions["Approach Control Boundaries"]) {
          const traconMapsQuery = await fetch(`${baseUrl}/maps/tracons/${ARTCC}`);
          const traconMaps = await traconMapsQuery.json();
          mapIds.push(...traconMaps);
        }

        const videoMapBaseURL = (getState() as any).auth.vnasConfiguration.videoMapBaseUrl;

        const featurePromises = mapIds.map(async (mapId: string) => {
          const featureQuery = await fetch(`${videoMapBaseURL}/${ARTCC}/${mapId}.geojson`);
          if (!featureQuery.ok) {
            throw new Error(`could not fetch map feature with ID ${mapId}`);
          }
          return featureQuery.json();
        });

        const returnData = await Promise.all(featurePromises);

        return { data: returnData };
      },
    }),
    getEnabledWhiteLineFeatures: builder.query<FeatureCollection[], string>({
      queryFn: async (_, { getState }) => {
        const state = getState() as any;
        const ARTCC = state.auth.session.artccId;
        const mapIds = [];
        console.log(state.gpd.mapFeatureOptions)
        if (state.gpd.mapFeatureOptions.High) {
          const highMapsQuery = await fetch(`${baseUrl}/maps/sectors/high/${ARTCC}`);
          const highMaps = await highMapsQuery.json();
          mapIds.push(...highMaps);
        }

        if (state.gpd.mapFeatureOptions.Low) {
          const lowMapsQuery = await fetch(`${baseUrl}/maps/sectors/low/${ARTCC}`);
          const lowMaps = await lowMapsQuery.json();
          mapIds.push(...lowMaps);
        }

        if (state.gpd.mapFeatureOptions["Ultra Low"]) {
          const ultraLowMapsQuery = await fetch(`${baseUrl}/maps/sectors/ultraLow/${ARTCC}`);
          const ultraLowMaps = await ultraLowMapsQuery.json();
          mapIds.push(...ultraLowMaps);
        }

        if (state.gpd.mapFeatureOptions["Ultra High"]) {
          const ultraHighMapsQuery = await fetch(`${baseUrl}/maps/sectors/ultraHigh/${ARTCC}`);
          const ultraHighMaps = await ultraHighMapsQuery.json();
          mapIds.push(...ultraHighMaps);
        }

        if (state.gpd.mapFeatureOptions.NAVAIDS) {
          const navaidMapsQuery = await fetch(`${baseUrl}/maps/navaids/${ARTCC}`);
          const navaidMaps = await navaidMapsQuery.json();
          mapIds.push(...navaidMaps);
        }

        if (state.gpd.mapFeatureOptions.Airport) {
          const airportMapsQuery = await fetch(`${baseUrl}/maps/airports/${ARTCC}`);
          const airportMaps = await airportMapsQuery.json();
          mapIds.push(...airportMaps);
        }

        const videoMapBaseURL = (getState() as any).auth.vnasConfiguration.videoMapBaseUrl;

        const featurePromises = mapIds.map(async (mapId: string) => {
          const featureQuery = await fetch(`${videoMapBaseURL}/${ARTCC}/${mapId}.geojson`);
          if (!featureQuery.ok) {
            throw new Error(`could not fetch map feature with ID ${mapId}`);
          }
          return featureQuery.json();
        });

        const returnData = await Promise.all(featurePromises);

        return { data: returnData };
      },
    }),
    getEnabledTextFeatures: builder.query<FeatureCollection[], string>({
      queryFn: async (_, { getState }) => {
        const state = getState() as any;
        const ARTCC = state.auth.session.artccId;
        const mapIds = [];

        if (state.gpd.mapFeatureOptions["NAVAID Labels"]) {
          const navaidLabelsMapsQuery = await fetch(`${baseUrl}/maps/navaidsText/${ARTCC}`);
          const navaidLabelsMaps = await navaidLabelsMapsQuery.json();
          mapIds.push(...navaidLabelsMaps);
        }

        if (state.gpd.mapFeatureOptions["Airport Labels"]) {
          const airportLabelsMapsQuery = await fetch(`${baseUrl}/maps/airportLabels/${ARTCC}`);
          const airportLabelsMaps = await airportLabelsMapsQuery.json();
          mapIds.push(...airportLabelsMaps);
        }

        const videoMapBaseURL = (getState() as any).auth.vnasConfiguration.videoMapBaseUrl;

        const featurePromises = mapIds.map(async (mapId: string) => {
          const featureQuery = await fetch(`${videoMapBaseURL}/${ARTCC}/${mapId}.geojson`);
          if (!featureQuery.ok) {
            throw new Error(`could not fetch map feature with ID ${mapId}`);
          }
          return featureQuery.json();
        });

        const returnData = await Promise.all(featurePromises);

        return { data: returnData };
      },
    }),
    getEnabledMapFeatures: builder.query<FeatureCollection[], string>({
      queryFn: async (_, { getState }) => {
        const state = getState() as any;
        const ARTCC = state.auth.session.artccId;
        const mapIds = [];
        if (state.gpd.mapFeatureOptions["Approach Control Boundaries"]) {
          const traconMapsQuery = await fetch(`${baseUrl}/maps/tracons/${ARTCC}`);
          const traconMaps = await traconMapsQuery.json();
          mapIds.push(...traconMaps);
        }

        const videoMapBaseURL = (getState() as any).auth.vnasConfiguration.videoMapBaseUrl;

        const featurePromises = mapIds.map(async (mapId: string) => {
          const featureQuery = await fetch(`${videoMapBaseURL}/${ARTCC}/${mapId}.geojson`);
          if (!featureQuery.ok) {
            throw new Error(`could not fetch map feature with ID ${mapId}`);
          }
          return featureQuery.json();
        });

        const returnData = await Promise.all(featurePromises);

        return { data: returnData };
      },
    }),
  }),
});

const {
  useGetArtccBoundariesQuery,
  useGetEnabledMapFeaturesQuery,
  useGetTraconMapsQuery,
  useGetEnabledWhiteLineFeaturesQuery,
  useGetEnabledTextFeaturesQuery,
} = gpdApi;

export const useArtccBoundaries = (optionsKey: string) => {
  return useGetArtccBoundariesQuery(optionsKey);
};

export const useEnabledMapFeatures = (optionsKey: string) => {
  return useGetEnabledMapFeaturesQuery(optionsKey);
};

export const useTraconMaps = (optionsKey: string) => {
  return useGetTraconMapsQuery(optionsKey);
};

export const useEnabledWhiteLines = (optionsKey: string) => {
  return useGetEnabledWhiteLineFeaturesQuery(optionsKey);
};

export const useEnabledTextLabels = (optionsKey: string) => {
  return useGetEnabledTextFeaturesQuery(optionsKey);
};