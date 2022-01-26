import {Stack, Typography} from "@mui/material";
import {GetServerSideProps, NextPage} from "next";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {ChoreMeAvatar} from "../../../components/avatar";
import {NormalButton} from "../../../components/button";
import {ChoreLayout} from "../../../components/layout";
import {ChoreNavigation} from "../../../components/navigation";
import {AssignedChoreTable} from "../../../components/table";
import {useToast} from "../../../hooks";
import {useUpdateChoreMutation, useUpdateTaskMutation} from "../../../lib/api";
import {formatDate} from "../../../lib/date";
import dbConnect from "../../../lib/db";
import {MongoDocument} from "../../../types";
import {TaskChoreVM} from "../../../types/vm";
import Task, {ITask} from "../../../models/task.model";
import {getTaskChore} from "../../../lib/task.service";
import {TaskStatus} from "../../../types/enum";
import {IUser, User} from "../../../models";
import moment from "moment";
import {useEffect, useState} from "react";

const AssignedChores: NextPage<StaticProps> = ({chores}) => {
  const [updateChore, {isLoading: isUpdating}] = useUpdateChoreMutation();
  const [updateTask, {isLoading: isUpdatingTask}] = useUpdateTaskMutation();

  const {showToast} = useToast();
  const router = useRouter();
  const session = useSession();
  // console.log(router.query);
  const {day} = router.query;

  const [date, setDate] = useState<Date>(day ? new Date(day as string) : new Date());

  useEffect(() => {
    router.push(
      `/parent/assigned-chores?day=${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`
    );
  }, [date]);

  const handleDateChange = (value: number) => {
    setDate((prevState) => moment(prevState).add(value, "days").toDate())
  };

  const choreRejecter = (_id: string) => {
    // const _chore = chores.find((c) => c.id === chore);
    updateTask({_id, status: TaskStatus.UnFinished})
      .unwrap()
      .then(() => {
        showToast("Chore updated successfully", "success");
        router.reload();
      })
      .catch((error) => {
        showToast(error.data.message, "error");
      });
  };


  return (
    <ChoreLayout
      avatar={<ChoreMeAvatar name={session.data?.user?.name ?? "Unknow"}/>}
      title="Assigned Chores"
    >
      <ChoreNavigation
        onNext={() => handleDateChange(1)}
        onPrevious={() => handleDateChange(-1)}
        indicatorText={formatDate(date)}
      />
      <AssignedChoreTable chores={chores} choreRejector={choreRejecter}/>
      <Stack alignItems={"flex-start"}>
        <NormalButton
          variant="contained"
          color="primary"
          onClick={() => {
            router.push("/parent/chores");
          }}
        >
          <Typography variant="button">Chores</Typography>
        </NormalButton>
      </Stack>
    </ChoreLayout>
  );
};

export default AssignedChores;

export type AssignedTaskChore = TaskChoreVM & {
  owner: MongoDocument<IUser>;
}
type StaticProps = {
  chores: AssignedTaskChore [];
}
export const getServerSideProps: GetServerSideProps<StaticProps> = async (
    context
  ) => {
    await dbConnect();

    let date: Date;

    if (context.query.day) {
      date = new Date(context.query.day as string);
    } else {
      date = new Date();
    }

    const tasks = (
      await Task.find({
        startDate: {
          $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      }).exec()
    ).map((doc) =>
      JSON.parse(JSON.stringify(doc.toJSON<MongoDocument<ITask>>()))
    );
    const taskChores = await Promise.all((await getTaskChore(tasks)).map(async (taskChore) => {
      const user = await User.findById(taskChore.task.owner)
      return {
        chore: taskChore.chore,
        task: taskChore.task,
        owner:
          JSON.parse(JSON.stringify(user?.toJSON())),
      }
    }));
    return {
      props: {
        chores: taskChores,
      },
    };
  }
;
