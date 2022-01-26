import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  startDate: Date;
  finishedDate?: Date;
  paidDate?: Date;
  status: string;
  owner: string;
  chore: string;
}

const TaskSchema: Schema = new Schema({
  startDate: { type: Date, required: true },
  finishedDate: { type: Date },
  paidDate: { type: Date },
  status: { type: String, default: "unfinished" },
  owner: {
    type: { type: Schema.Types.ObjectId, ref: "User" },
  },
  chore: {
    type: { type: Schema.Types.ObjectId, ref: "Chore" },
  },
});

const Task =
  (mongoose.models.Task as mongoose.Model<ITask>) ||
  mongoose.model<ITask>("Task", TaskSchema);
export default Task;
