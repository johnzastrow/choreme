import { Router } from "@mui/icons-material";
import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { NextPage, GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { ChoreMeAvatar } from "../../components/avatar";
import { NormalButton } from "../../components/button";
import { ChoreLayout } from "../../components/layout";
import { RewardsTable } from "../../components/table";
import { RewardsTableHandle } from "../../components/table/RewardsTable";
import { useToast } from "../../hooks";
import { useAddPointsMutation, useUpdateChoreMutation } from "../../lib/api";
import dbConnect from "../../lib/db";
import { Chore, User } from "../../models";
import { MongoDocument, Role } from "../../types";
import { ChoreVM, UserVM } from "../../types/vm";

type State = {
  selectedChild?: string;
  displayingChores: MongoDocument<ChoreVM>[];
};

const Rewards: NextPage<StaticProps> = ({ users, chores }) => {
  const [updateChore, { isLoading: isUpdating }] = useUpdateChoreMutation();
  const [addPoints, { isLoading: isAdding }] = useAddPointsMutation();
  const router = useRouter();
  const session = useSession();
  const { showToast } = useToast();
  const [state, setState] = React.useState<State>({
    displayingChores: chores,
  });
  const tableRef = React.createRef<RewardsTableHandle>();
  const summary: { [key: string]: any } = {};
  users.forEach((user) => {
    summary[user._id] = {};
    summary[user._id]["points"] = 0;
    chores.forEach((chore) => {
      if (chore.assignedTo.includes(user._id)) {
        summary[user._id].points += chore.points;
      }
    });
  });

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

  const rewardChores = (_chores: MongoDocument<ChoreVM>[]) => {
    _chores.forEach((chore) => {
      const { _id, ...choreData } = chore;
      const assignedTo = chore.assignedTo;
      choreData.paidDate = new Date();
      // const _addPointPM = addPoints({
      //   userIds: assignedTo,
      //   points: choreData.points,
      // }).unwrap();
      const _updateChorePM = updateChore({ _id, ...choreData }).unwrap();
      Promise.all([_updateChorePM])
        .then(() => {
          showToast(`Successfully rewarded chore: ${chore.name}`, "success");
        })
        .catch((error) => {
          showToast(error.data.message, "error");
        });
    });
  };

  return (
    <ChoreLayout
      isLoading={isUpdating}
      avatar={<ChoreMeAvatar name={session.data?.user?.name ?? "Unknow"} />}
    >
      <Stack direction={"row"}>
        <Container>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120, flex: 1 }}>
            <InputLabel id="demo-simple-select-standard-label">
              Child
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={state.selectedChild}
              onChange={(e) => {
                console.log(e.target.value);
                setState({
                  ...state,
                  selectedChild: e.target.value,
                  displayingChores: chores.filter((chore) =>
                    chore.assignedTo.includes(e.target.value)
                  ),
                });
              }}
              label="Child"
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.firstName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Container>
        <Container>
          <Typography variant="h5">Owned</Typography>
          {users.map((user) => (
            <Typography variant="h5" key={user.id}>
              {user.firstName}: {summary[user._id].points}
            </Typography>
          ))}
        </Container>
      </Stack>
      <RewardsTable
        chores={state.displayingChores}
        ref={tableRef}
        rejecter={choreRejecter}
      />
      <Stack flexDirection={"row"}>
        <NormalButton
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
          onClick={() => {
            tableRef.current?.clearSelectedItems();
            // console.log(tableRef.current?.getSelectedItems());
          }}
        >
          <Typography variant="button">Delete Selected</Typography>
        </NormalButton>
        <NormalButton
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
          onClick={() => {
            rewardChores(chores);
          }}
        >
          <Typography variant="button">Reward All</Typography>
        </NormalButton>
        <NormalButton
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
          onClick={() => {
            const selectedChores = tableRef.current?.getSelectedItems();
            selectedChores && rewardChores(selectedChores);
          }}
        >
          <Typography variant="button">Reward Selected</Typography>
        </NormalButton>
      </Stack>
    </ChoreLayout>
  );
};

export default Rewards;

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

  const chores = (
    await Chore.find({
      status: { $eq: "finished" },
      paidDate: undefined,
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
