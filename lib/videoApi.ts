import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { VideoCopyStatus, VideoStatus } from "./types";

const API_KEY = "HMS7dMgGTT5CvkRBmnalmgAIwBquAwUwsQws7v-J";
const headers = {
  "ganos-api-key": API_KEY,
  "Content-Type": "application/json",
};

export const videoApi = createApi({
  reducerPath: "videoApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://os.gan.ai/v1/avatars" }),
  endpoints: (builder) => ({
    uploadVideo: builder.mutation<
      { avatar_id: string },
      { base_video_url: string }
    >({
      query: (body) => ({
        url: "create_avatar",
        headers,
        method: "POST",
        body: {
          ...body,
          bypass: {
            bypass_consent: true,
            bypass_voice_creation: false,
            bypass_training: false,
          },
        },
      }),
    }),
    checkStatus: builder.query<
      {
        avatar_id: string;
        status: VideoStatus;
      },
      { avatar_id: string }
    >({
      query: ({ avatar_id }) => ({
        url: `avatar_details`,
        headers,
        method: "GET",
        params: { avatar_id: avatar_id },
      }),
    }),
    generateVideoCopy: builder.mutation<
      { inference_id: string },
      { avatar_id: string; text: string }
    >({
      query: (body) => ({
        url: "create_video",
        headers,
        method: "POST",
        body,
      }),
    }),
    checkVideoCopyStatus: builder.query<
      { status: VideoCopyStatus; inference_id: string; video: string },
      { inference_id: string }
    >({
      query: ({ inference_id }) => ({
        url: `inference_details`,
        headers,
        method: "GET",
        params: { inference_id },
      }),
    }),
  }),
});

export const {
  useUploadVideoMutation,
  useCheckStatusQuery,
  useCheckVideoCopyStatusQuery,
  useGenerateVideoCopyMutation,
} = videoApi;
