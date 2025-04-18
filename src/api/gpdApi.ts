/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FeatureCollection } from "geojson";

// Define a service using a base URL and expected endpoints
export const gpdApi = createApi({
  reducerPath: "gpdApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getArtccBoundaries: builder.query<FeatureCollection, Record<never, never>>({
      queryFn: async (_, { getState }) => {
        // we cannot put RootState here because then gpdApi would reference itself
        const url = (getState() as any).auth.vnasConfiguration.artccBoundariesUrl;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("could not fetch ARTCC boundaries");
        }
        const data = await response.json();
        return { data };
      },
    }),
    getMapFeature: builder.query<FeatureCollection, string>({
      queryFn: async (featureId, { getState }) => {
        const videoMapBaseURL = (getState() as any).auth.vnasConfiguration.videoMapBaseUrl;
        const apiURL = (getState() as any).auth.vnasConfiguration.dataApiBaseUrl;
        console.log(featureId);
        const objectQuery = await fetch(`${apiURL}/artccs/ZSE`);
        const artccObject = await objectQuery.json();
        const featureQuery = await fetch(`${videoMapBaseURL}/ZSE/${artccObject.videoMaps[501].id}.geojson`);
        console.log(featureQuery);
        if (!featureQuery.ok) {
          throw new Error("could not fetch ARTCC boundaries");
        }
        const data = await featureQuery.json();
        console.log(data);
        return { data };
      },
    }),
  }),
});

const { useGetArtccBoundariesQuery, useGetMapFeatureQuery } = gpdApi;

export const useArtccBoundaries = () => {
  return useGetArtccBoundariesQuery({});
};

export const useMapFeatures = (featureId: string) => {
  return useGetMapFeatureQuery(featureId);
};