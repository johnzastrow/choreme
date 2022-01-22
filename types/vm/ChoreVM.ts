import {IChore} from "../../models";
import {ITask} from "../../models/task.model";

export type ChoreVM = {
  id: IChore["id"];
  name: IChore["name"];
  points: IChore["points"];
  assignedTo: IChore["assignedTo"];
  startDate: ITask["startDate"];
};
