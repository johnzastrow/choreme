import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../../lib/db";
import { User } from "../../../../models";
import { SignUpResponse } from "../../../../types/dto";
import { AddPointsVM } from "../../../../types/vm";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignUpResponse | any>
) {
  //POST method for chore creation
  await dbConnect();
  if (req.method !== "PUT") {
    return res.status(500).json({ message: "Route not valid" });
  } else {
    const { userIds, points } = req.body as AddPointsVM;
    const averagePoints = points / userIds.length;
    //Getting email and password from body
    const updatePromises = userIds.map(async (userId) => {
      const currentUser = await User.findById(userId).exec();
      if (currentUser) {
        await User.findByIdAndUpdate(userId, {
          ...currentUser,
          pointsOwned: currentUser.pointsOwned + averagePoints,
        }).exec();
      }
    });
    Promise.all(updatePromises)
      .then(() => {
        return res.status(204).json({ message: "Points updated" });
      })
      .catch(() => {
        return res.status(500).json({ message: "internal error" });
      });
  }
}

export default handler;
