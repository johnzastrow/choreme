import {NextApiRequest, NextApiResponse} from "next";
import dbConnect from "../../../../lib/db";
import Task, {ITask} from "../../../../models/task.model";
import {SignUpResponse} from "../../../../types/dto";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignUpResponse | any>
) {
  //POST method for chore creation
  await dbConnect();
  if (req.method === "PUT") {
    const { _id } = req.query;
    const updatingData = req.body as Partial<ITask>;
    try {
      const updatedTask = await Task.findByIdAndUpdate(_id, {
        ...updatingData,
      }).exec();
      return res
        .status(204)
        .json({ message: "Task updated", chore: updatedTask });
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
