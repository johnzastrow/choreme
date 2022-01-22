import { Container, Stack, Typography } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { ChoreMeAvatar } from "../../components/avatar/ChoreMeAvatar";
import { NormalButton } from "../../components/button";
import { ChoreLayout } from "../../components/layout";
import { ChildrenPaidTable } from "../../components/table/ChildrenPaidTable";
import dbConnect from "../../lib/db";
import { getUserOwed, getTaskChore } from "../../lib/task.service";
import { groupBy } from "../../lib/utils";
import { Chore, IChore, User } from "../../models";
import Task, { ITask } from "../../models/task.model";
import { MongoDocument } from "../../types";
import { TaskStatus } from "../../types/enum";
import { TaskChoreVM } from "../../types/vm";

const Rewards: NextPage<StaticProps> = ({ groupedChores, owedPoints }) => {
  const session = useSession();

  return (
    <ChoreLayout
      title={`${session.data?.user?.name}'s Rewards`}
      // @ts-ignore
      avatar={<ChoreMeAvatar name={session.data?.user?.name} />}
    >
      <Stack direction={"row"}>
        <Container>
          <Typography variant="h5">Owed: {owedPoints}</Typography>
        </Container>
      </Stack>
      <ChildrenPaidTable chores={groupedChores} />
      <Stack flexDirection={"row"}>
        <Link href="/children">
          <NormalButton variant="contained" color="primary" sx={{ flex: 1 }}>
            <Typography variant="button">Chores</Typography>
          </NormalButton>
        </Link>
      </Stack>
    </ChoreLayout>
  );
};

export default Rewards;

type StaticProps = {
  groupedChores: { [key: string]: TaskChoreVM[] };
  owedPoints: number;
};

export const getServerSideProps: GetServerSideProps<StaticProps> = async (
  context
) => {
  await dbConnect();

  const session = await getSession({ req: context.req });

  let chores: { [key: string]: TaskChoreVM[] } = {};
  let owedPoints = 0;
  if (session) {
    const user = await User.findOne({ email: session.user?.email }).exec();
    if (user) {
      Object.entries(
        groupBy<MongoDocument<ITask>>(
          (
            await Task.find({
              owner: user._id,
              status: TaskStatus.Finished,
              paidDate: { $exists: true },
            }).exec()
          ).map((doc) =>
            JSON.parse(JSON.stringify(doc.toJSON<MongoDocument<ITask>>()))
          ),
          "paidDate"
        )
      ).forEach(async ([key, tasks]) => {
        chores[key] = await getTaskChore(tasks);
      });

      owedPoints = await getUserOwed(user._id);
    }
  }
  return {
    props: {
      groupedChores: chores,
      owedPoints,
    },
  };
};
