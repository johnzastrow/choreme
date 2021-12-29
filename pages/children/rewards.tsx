import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { ChoreMeAvatar } from "../../components/avatar/ChoreMeAvatar";
import { NormalButton } from "../../components/button";
import { ChoreLayout } from "../../components/layout";
import { ChildrenPaidTable } from "../../components/table/ChildrenPaidTable";
import dbConnect from "../../lib/db";
import { Chore, User } from "../../models";
import { MongoDocument } from "../../types";
import { ChoreVM } from "../../types/vm";

const Rewards: NextPage<StaticProps> = ({ chores }) => {
  const session = useSession();

  let points = 0;
  chores.forEach((chore) => {
    if (chore.paidDate === undefined) {
      points += chore.points;
    }
  });

  return (
    <ChoreLayout
      title={`${session.data?.user?.name}'s Rewards`}
      // @ts-ignore
      avatar={<ChoreMeAvatar name={session.data?.user?.name} />}
    >
      <Stack direction={"row"}>
        <Container>
          <Typography variant="h5">Owned: {points}</Typography>
        </Container>
      </Stack>
      <ChildrenPaidTable
        chores={chores.filter((chore) => chore.paidDate !== undefined)}
      />
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
  chores: MongoDocument<ChoreVM>[];
};

export const getServerSideProps: GetServerSideProps<StaticProps> = async (
  context
) => {
  await dbConnect();

  const session = await getSession({ req: context.req });

  let _chores = [];
  if (session) {
    const user = await User.findOne({ email: session.user?.email }).exec();
    if (user) {
      _chores = (
        await Chore.find({
          assignedTo: user._id,
        }).exec()
      ).map((doc) =>
        JSON.parse(JSON.stringify(doc.toJSON<MongoDocument<ChoreVM>>()))
      );
    }
  }
  return {
    props: {
      chores: _chores,
    },
  };
};
