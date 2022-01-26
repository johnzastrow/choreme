import { ITask } from "../../models/task.model";

export type TaskVM = {
  startDate: ITask["startDate"];
  finishedDate: ITask["finishedDate"];
  paidDate: ITask["paidDate"];
  status: ITask["status"];
  owner: ITask["owner"];
  chore: ITask["chore"];
};
