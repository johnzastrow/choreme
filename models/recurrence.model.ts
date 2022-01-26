import mongoose, { Document, Schema } from "mongoose";
import { RecurrenceType } from "../types/enum";

export interface IRecurrence extends Document {
  id: string;
  type: RecurrenceType;
  repeat: number[];
  chore: string;
  startDate: Date;
}

const RecurrenceSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  chore: {
    type: { type: Schema.Types.ObjectId, ref: "Chore" },
  },
  type: { type: String, default: "None" },
  repeat: {
    type: [{ type: Number }],
    required: true,
  },
  startDate: { type: Date },
});

const Recurrence =
  (mongoose.models.Recurrence as mongoose.Model<IRecurrence>) ||
  mongoose.model<IRecurrence>("Recurrence", RecurrenceSchema);
export default Recurrence;
