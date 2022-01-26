import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {ITask} from "../models/task.model";
import {Response} from "../types/dto";
import {SignUpResponse} from "../types/dto/SignUpResponse";
import {ChoreVM} from "../types/vm";
import {AddPointsVM} from "../types/vm/AddPointsVM";
import {CreateChoreVM} from "../types/vm/CreateChoreVM";
import {SignUpVM} from "../types/vm/SignUpVM";
import {IChore} from "../models";
import {IRecurrence} from "../models/recurrence.model";

export const api = createApi({
  baseQuery: fetchBaseQuery({baseUrl: "/"}),
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
    createChore: builder.mutation<Response<ChoreVM>, CreateChoreVM>({
      query: (vm) => ({
        url: `/api/parent/chore`,
        method: "POST",
        body: vm,
      }),
    }),
    updateChore: builder.mutation<Response<ChoreVM>,
      { _id: string } & { chore: Partial<IChore>; recurrence: Partial<IRecurrence> }>({
      query: ({_id, ...vm}) => ({
        url: `/api/parent/chore?_id=${_id}`,
        method: "PUT",
        body: vm,
      }),
    }),
    updateTask: builder.mutation<Response<any>,
      { _id: string } & Partial<ITask>>({
      query: ({_id, ...vm}) => ({
        url: `/api/parent/chore/task?_id=${_id}`,
        method: "PUT",
        body: vm,
      }),
    }),
    finishChore: builder.mutation<Response, { _id: string }>({
      query: ({_id}) => ({
        url: `/api/children/chore?_id=${_id}`,
        method: "PUT",
      }),
    }),
    deleteChore: builder.mutation<Response<ChoreVM>, { _id: string }>({
      query: ({_id}) => ({
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
  useUpdateTaskMutation,
} = api;
