export type { SignUpResponse } from "./SignUpResponse";

export type Response<T = any> = { message: string } & {
  [key: string]: T;
};
