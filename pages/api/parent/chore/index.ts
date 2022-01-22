import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../../lib/db";
import { Chore } from "../../../../models";
import Recurrence from "../../../../models/recurrence.model";
import { MongoDocument } from "../../../../types";
import { SignUpResponse } from "../../../../types/dto";
import { RecurrenceType } from "../../../../types/enum";
import { CreateChoreVM } from "../../../../types/vm/CreateChoreVM";
import { createTasks } from "../../../../lib/task.service";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignUpResponse | any>
) {
  //POST method for chore creation
  await dbConnect();
  if (req.method === "POST") {
    const { chore, recurrence } = req.body as CreateChoreVM;
    console.log(req.body);
    //Getting email and password from body
    try {
      const newChore = await Chore.create(chore);
      const newRecurrence = await Recurrence.create(recurrence);
      await newChore.update({
        recurrence: newRecurrence._id,
      });

      await newRecurrence.update({
        chore: newChore._id,
      });

      await createTasks(newChore, newRecurrence);

      return res
        .status(201)
        .json({ message: "Chore created", chore: newChore });
    } catch (e) {
      console.log(e);
      // @ts-ignore
      switch (e.code) {
        case 11000:
          return res.status(400).json({ message: "Chore already exists" });
        default:
          return res.status(500).json({ message: "Internal server error" });
      }
    }
  } else if (req.method === "PUT") {
    const { chore, recurrence } = req.body as MongoDocument<CreateChoreVM>;
    //Getting email and password from body
    const { _id } = req.query;
    try {
      const updatedChore = await Chore.findByIdAndUpdate(_id, chore).exec();
      if (recurrence.type !== RecurrenceType.None) {
        await Recurrence.findByIdAndUpdate(
          updatedChore?.recurrence,
          recurrence
        ).exec();
      }
      return res
        .status(204)
        .json({ message: "Chore updated", chore: updatedChore });
    } catch (e) {
      console.log(e);
      return res.status(500).json(e);
    }
  } else if (req.method === "DELETE") {
    const { _id } = req.query;
    try {
      await Chore.findByIdAndDelete(_id).exec();
      return res.status(202).json({ message: "Chore deleted" });
    } catch (e) {
      console.log(e);
      return res.status(500).json(e);
    }
  } else {
    //Response for other than POST method
    return res.status(500).json({ message: "Route not valid" });
  }
}

export default handler;
