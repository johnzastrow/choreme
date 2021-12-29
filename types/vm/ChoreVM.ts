import { IChore } from "../../models/chore.model";

export type ChoreVM = {
  id: IChore["id"];
  name: IChore["name"];
  points: IChore["points"];
  assignedTo: IChore["assignedTo"];
  createdDate: IChore["createdDate"];
  startDate?: IChore["startDate"];
  finishedDate?: IChore["finishedDate"];
  paidDate?: IChore["paidDate"];
  recurrence: IChore["recurrence"];
  status: IChore["status"];
};
