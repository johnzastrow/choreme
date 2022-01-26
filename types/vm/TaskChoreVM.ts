import { MongoDocument } from "..";
import { IChore } from "../../models";
import { ITask } from "../../models/task.model";

export type TaskChoreVM = {
  task: MongoDocument<ITask>;
  chore: MongoDocument<IChore> | null;
};
