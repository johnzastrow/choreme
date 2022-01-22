import { TaskChoreVM } from ".";
import { MongoDocument } from "..";
import { IUser } from "../../models";

export type UserTaskData = {
  profile: MongoDocument<IUser>;
  owed: number;
  tasks: TaskChoreVM[];
};
