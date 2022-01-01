import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Response } from "../types/dto";
import { SignUpResponse } from "../types/dto/SignUpResponse";
import { ChoreVM } from "../types/vm";
import { AddPointsVM } from "../types/vm/AddPointsVM";
import { SignUpVM } from "../types/vm/SignUpVM";
export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  reducerPath: "api",
  endpoints: (builder) => ({
    signup: builder.mutation<SignUpResponse, SignUpVM>({
      query: (vm) => ({
        url: "/api/auth/signup",
        method: "POST",
        body: vm,
      }),
    }),
    addPoints: builder.mutation<Response, AddPointsVM>({
      query: (vm) => ({
        url: "/api/parent/points/add",
        method: "PUT",
        body: vm,
      }),
    }),
    createChore: builder.mutation<Response<ChoreVM>, ChoreVM>({
      query: (vm) => ({
        url: `/api/parent/chore`,
        method: "POST",
        body: vm,
      }),
    }),
    updateChore: builder.mutation<Response<ChoreVM>, { _id: string } & ChoreVM>(
      {
        query: ({ _id, ...vm }) => ({
          url: `/api/parent/chore?_id=${_id}`,
          method: "PUT",
          body: vm,
        }),
      }
    ),
    finishChore: builder.mutation<Response, { _id: string }>({
      query: ({ _id }) => ({
        url: `/api/children/chore?_id=${_id}`,
        method: "PUT",
      }),
    }),
    deleteChore: builder.mutation<Response<ChoreVM>, { _id: string }>({
      query: ({ _id }) => ({
        url: `/api/parent/chore?_id=${_id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useCreateChoreMutation,
  useUpdateChoreMutation,
  useDeleteChoreMutation,
  useAddPointsMutation,
  useFinishChoreMutation,
} = api;
