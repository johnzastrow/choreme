import mongoose, { Document, Schema } from "mongoose";

export interface IChore extends Document {
  id: string;
  name: string;
  points: number;
  assignedTo: string[];
  createdDate: Date;
  startDate?: Date;
  finishedDate?: Date;
  paidDate?: Date;
  recurrence: string;
  status: string;
}

const ChoreSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  points: { type: Number, required: true },
  assignedTo: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    required: true,
  },
  createdDate: { type: Date, default: Date.now },
  startDate: { type: Date },
  finishedDate: { type: Date },
  paidDate: { type: Date },
  recurrence: { type: String, default: "None" },
  status: { type: String, default: "unfinished" },
});

const Chore =
  (mongoose.models.Chore as mongoose.Model<IChore>) ||
  mongoose.model<IChore>("Chore", ChoreSchema);
export default Chore;
