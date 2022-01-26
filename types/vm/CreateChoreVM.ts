import { RecurrenceType } from "../enum";

export type CreateChoreVM = {
  chore: {
    id: string;
    name: string;
    points: number;
    assignedTo: string[]; // list of child id
  };
  recurrence: {
    id: string;
    type: RecurrenceType;
    repeat: number[];
    startDate: Date; // startDate value when creating chore
  };
};
