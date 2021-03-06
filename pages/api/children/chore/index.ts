import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../../lib/db";
import { Chore } from "../../../../models";
import Task from "../../../../models/task.model";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  //POST method for chore creation
  await dbConnect();
  if (req.method === "PUT") {
    const { _id } = req.query;
    //Getting email and password from body
    try {
      await Task.findByIdAndUpdate(_id, {
        status: "finished",
      }).exec();
      return res.status(201).json({ message: "Task finished" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    //Response for other than POST method
    return res.status(500).json({ message: "Route not valid" });
  }
}

export default handler;
