import { IUser } from "../../models";

export type UserVM = {
  id: IUser["id"];
  firstName: IUser["firstName"];
  lastName: IUser["lastName"];
  email: IUser["email"];
  password: IUser["password"];
  updatedAt: IUser["updatedAt"];
  role: IUser["role"];
  pointsOwned: IUser["pointsOwned"];
};
