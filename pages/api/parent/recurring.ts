import moment from "moment";
import {NextApiRequest, NextApiResponse} from "next";
import dbConnect from "../../../lib/db";
import Recurrence from "../../../models/recurrence.model";
import Task from "../../../models/task.model";
import Chore from "../../../models/chore.model";
import {createTasks} from "../../../lib/task.service";
import {calculateNextStartDate} from "../../../lib/date";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  //POST method for chore creation
  await dbConnect();
  if (req.method === "GET") {
    // const {chore, recurrence} = req.body as CreateChoreVM
    //Getting email and password from body
    try {
      const recurrences = await Recurrence.find({});
      const today = new Date().setHours(0, 0, 0, 0);
      const result = await Promise.all(
        recurrences.map(async (recurrence) => {
          if (recurrence.type === "None") {
            return
          }
          const chore = await Chore.findById(recurrence.chore);
          if (chore) {
            const tasks = await Task.find({chore: recurrence.chore}).exec();
            const nextTask = tasks.find((task) => {
              const _stateDate = task.startDate
              _stateDate.setHours(0, 0, 0, 0)
              return moment(_stateDate).isAfter(today);
            });
            if (!nextTask) {
              const _recurrence = recurrence;
              _recurrence.startDate = calculateNextStartDate(recurrence);
              return await createTasks(chore, _recurrence);
            }
          }
        })
      );
      return res.status(200).json({
        message: `Successfully run recurrences cron job. ${result.length} tasks created: `,
        result,
      });
      // return res.status(201).json({ message: 'Chore created', chore: newChore })
    } catch (e) {
      console.log(e);
      // @ts-ignore
      switch (e.code) {
        case 11000:
          return res.status(400).json({message: "Chore already exists"});
        default:
          return res.status(500).json({message: "Internal server error"});
      }
    }
  } else {
    //Response for other than POST method
    return res.status(500).json({message: "Route not valid"});
  }
}

export default handler;
