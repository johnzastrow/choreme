import { IChore } from "../models/chore.model";
import { IRecurrence } from "../models/recurrence.model";
import dbConnect from "./db";
import Task, { ITask } from "../models/task.model";
import { TaskStatus } from "../types/enum/TaskStatus";
import Chore from "../models/chore.model";
import { MongoDocument } from "../types/MongoDocument";
import {ObjectId} from "mongodb";

export const createTasks = async (chore: IChore, recurrence: IRecurrence) => {
  await dbConnect();
  return await Promise.all(
    chore.assignedTo.map(async (owner) => {
      const newTask = await Task.create({
        startDate: recurrence.startDate,
        status: TaskStatus.UnFinished,
      });
      await newTask.update({
        chore: chore._id,
        owner: owner,
      });

      return Task.findById(newTask._id).populate("chore").populate("owner");
    })
  );
};

export const getUserOwed = async (userId: string) => {
  await dbConnect();
  const _tasks = await Task.find({
    status: { $eq: "finished" },
    owner: new ObjectId(userId),
    paidDate: { $exists: false },
  })
    .populate("chore")
    .exec();

  return (
    (
      await Promise.all(
        _tasks.map(async (task) => {
          const chore = await Chore.findById(task.chore);
          if (chore) {
            return chore.points;
          }
        })
      )
    )
      .filter(Number)
      .reduce((acc, points) => {
        return acc! + points!;
      }, 0) ?? 0
  );
};

export const getUserRewards = async (userId: string) => {
  await dbConnect();
  const _tasks = await Task.find({
    status: { $eq: "finished" },
    owner: new ObjectId(userId),
    paidDate: { $exists: true },
  })
    .exec();

  return (
    (
      await Promise.all(
        _tasks.map(async (task) => {
          const chore = await Chore.findById(task.chore);
          if (chore) {
            return chore.points;
          }
        })
      )
    )
      .filter(Number)
      .reduce((acc, points) => {
        return acc! + points!;
      }, 0) ?? 0
  );
};

export const getTaskChore = async (tasks: MongoDocument<ITask>[]) => {
  await dbConnect();
  return await Promise.all(
    tasks.map(async (task) => {
      return {
        task: task,
        chore: JSON.parse(
          JSON.stringify(
            (await Chore.findById(task.chore))?.toJSON<MongoDocument<IChore>>()
          )
        ) as MongoDocument<IChore>,
      };
    })
  );
};
