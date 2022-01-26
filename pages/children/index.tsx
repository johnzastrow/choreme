import { Stack, Typography } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChoreMeAvatar } from "../../components/avatar/ChoreMeAvatar";
import { NormalButton } from "../../components/button/NormalButton";
import { ChoreLayout } from "../../components/layout";
import { ChoreNavigation } from "../../components/navigation";
import { ChildrenAssignedChoreTable } from "../../components/table/ChildrenAssignedChoreTable";
import { useToast } from "../../hooks";
import { useFinishChoreMutation } from "../../lib/api";
import { formatDate } from "../../lib/date";
import dbConnect from "../../lib/db";
import { Chore, IChore, User } from "../../models";
import Task, { ITask } from "../../models/task.model";
import { MongoDocument } from "../../types";
import { TaskChoreVM } from "../../types/vm";
import { getUserOwed } from "../../lib/task.service";

const AssignedChores: NextPage<StaticProps> = ({ chores, owedPoints }) => {
  const router = useRouter();
  const session = useSession();
  const [finishChore, { isLoading }] = useFinishChoreMutation();
  const { showToast } = useToast();

  const { day } = router.query;

  const date = day ? new Date(day as string) : new Date();

  const handleDateChange = (value: number) => {
    date.setDate(date.getDate() + value);
    router.push(
      `/children?day=${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`
    );
  };

  return (
    <ChoreLayout
      title={`${session.data?.user?.name}'s Chores`}
      // @ts-ignore
      avatar={<ChoreMeAvatar name={session.data?.user?.name} />}
      isLoading={session.status === "loading" || isLoading}
    >
      <Stack direction={"row"}>
        <Typography variant="h5">Owed: {owedPoints}</Typography>
      </Stack>
      <ChoreNavigation
        onNext={() => handleDateChange(1)}
        onPrevious={() => handleDateChange(-1)}
        indicatorText={formatDate(date)}
      />
      <ChildrenAssignedChoreTable
        chores={chores}
        choreFinisher={(choreId: string) => {
          finishChore({ _id: choreId })
            .unwrap()
            .then(() => {
              showToast("Chore updated successfully", "success");
              router.reload();
            })
            .catch((error) => {
              showToast(error.data.message, "error");
            });
        }}
      />
      <Stack alignItems={"flex-start"}>
        <NormalButton
          variant="contained"
          color="primary"
          onClick={() => {
            router.push("/children/rewards");
          }}
        >
          <Typography variant="button">My Rewards</Typography>
        </NormalButton>
      </Stack>
    </ChoreLayout>
  );
};

export default AssignedChores;

type StaticProps = {
  chores: TaskChoreVM[];
  owedPoints: number;
};

export const getServerSideProps: GetServerSideProps<StaticProps> = async (
  context
) => {
  await dbConnect();
  let date: Date;

  const session = await getSession({ req: context.req });
  if (context.query.day) {
    date = new Date(context.query.day as string);
  } else {
    date = new Date();
  }

  let owedPoints = 0;
  let chores: TaskChoreVM[] = [];
  if (session) {
    const user = await User.findOne({ email: session.user?.email }).exec();
    if (user) {
      chores = await Promise.all(
        (
          await Task.find({
            startDate: {
              $gte: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              ),
              $lt: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate() + 1
              ),
            },
            owner: user._id,
          }).exec()
        )
          .map((doc) =>
            JSON.parse(JSON.stringify(doc.toJSON<MongoDocument<ITask>>()))
          )
          .map(async (task) => {
            return {
              task: task,
              chore: JSON.parse(
                JSON.stringify(
                  (await Chore.findById(task.chore))?.toJSON<
                    MongoDocument<IChore>
                  >()
                )
              ),
            };
          })
      );

      owedPoints = await getUserOwed(user._id);
    }
  }
  return {
    props: {
      chores,
      owedPoints,
    },
  };
};
