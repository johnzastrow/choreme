import mongoose, { Schema, Document } from "mongoose";
import { Role } from "../types";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  updatedAt: Date;
  role: string;
  pointsOwned: number;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    role: { type: String, default: "children" },
    pointsOwned: { type: Number, default: 0 },
  },
  {
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
export default User;
