import { Stack, Typography } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { NormalButton } from "../../../components/button";
import { ChoreLayout } from "../../../components/layout";
import { ChoreNavigation } from "../../../components/navigation";
import { AssignedChoreTable } from "../../../components/table";
import { useToast } from "../../../hooks";
import { useUpdateChoreMutation } from "../../../lib/api";
import dbConnect from "../../../lib/db";
import { Chore, User } from "../../../models";
import { MongoDocument, Role } from "../../../types";
import { ChoreVM, UserVM } from "../../../types/vm";

const AssignedChores: NextPage<StaticProps> = ({ users, chores }) => {
  const [updateChore, { isLoading: isUpdating }] = useUpdateChoreMutation();
  const { showToast } = useToast();
  const router = useRouter();
  // console.log(router.query);
  const { day } = router.query;

  const date = day ? new Date(day as string) : new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
  };

  const handleDateChange = (value: number) => {
    date.setDate(date.getDate() + value);
    router.push(
      `/parent/assigned-chores?day=${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`
    );
  };

  const choreRejecter = (chore: string) => {
    const _chore = chores.find((c) => c.id === chore);
    if (_chore) {
      const { _id, ...choreData } = _chore;
      choreData.status = "unfinished";
      updateChore({ _id, ...choreData })
        .unwrap()
        .then(() => {
          showToast("Chore updated successfully", "success");
          router.reload();
        })
        .catch((error) => {
          showToast(error.data.message, "error");
        });
    }
  };

  return (
    <ChoreLayout>
      <ChoreNavigation
        onNext={() => handleDateChange(1)}
        onPrevious={() => handleDateChange(-1)}
        indicatorText={date.toLocaleDateString("en-US", dateOptions)}
      />
      <AssignedChoreTable chores={chores} choreRejector={choreRejecter} />
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

type StaticProps = {
  users: MongoDocument<UserVM>[];
  chores: MongoDocument<ChoreVM>[];
};

export const getServerSideProps: GetServerSideProps<StaticProps> = async (
  context
) => {
  await dbConnect();
  //Check existing
  const users = (await User.find({ role: { $eq: Role.CHILDREN } }).exec()).map(
    (doc) => {
      const json = doc.toJSON<MongoDocument<UserVM>>();

      return JSON.parse(JSON.stringify(json));
    }
  );
  let date: Date;

  if (context.query.day) {
    date = new Date(context.query.day as string);
  } else {
    date = new Date();
  }

  const chores = (
    await Chore.find({
      startDate: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    }).exec()
  ).map((doc) =>
    JSON.parse(JSON.stringify(doc.toJSON<MongoDocument<ChoreVM>>()))
  );
  return {
    props: {
      users,
      chores,
    },
  };
};
