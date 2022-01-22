import mongoose, { Document, Schema } from "mongoose";

export interface IChore extends Document {
  id: string;
  name: string;
  points: number;
  assignedTo: string[];
  recurrence?: string;
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
  recurrence: { type: Schema.Types.ObjectId, ref: "Recurrence" },
});

const Chore =
  (mongoose.models.Chore as mongoose.Model<IChore>) ||
  mongoose.model<IChore>("Chore", ChoreSchema, "chore");
export default Chore;
