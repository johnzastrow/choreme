import {Container, FormControl, InputLabel, MenuItem, Select, Stack, Typography,} from "@mui/material";
import {ObjectId} from "mongodb";
import {GetServerSideProps, NextPage} from "next";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import React from "react";
import {ChoreMeAvatar} from "../../components/avatar";
import {NormalButton} from "../../components/button";
import {ChoreLayout} from "../../components/layout";
import {RewardsTable} from "../../components/table";
import {RewardsTableHandle} from "../../components/table/RewardsTable";
import {useToast} from "../../hooks";
import {useAddPointsMutation, useUpdateChoreMutation, useUpdateTaskMutation,} from "../../lib/api";
import dbConnect from "../../lib/db";
import {getTaskChore, getUserOwed} from "../../lib/task.service";
import {IUser, User} from "../../models";
import Task, {ITask} from "../../models/task.model";
import {MongoDocument, Role} from "../../types";
import {TaskStatus} from "../../types/enum";
import {ChoreVM, TaskChoreVM, UserTaskData} from "../../types/vm";

type State = {
  selectedChild?: string;
  displayingChores: MongoDocument<ChoreVM>[];
};

const Rewards: NextPage<StaticProps> = ({users}) => {
  const [updateChore, {isLoading: isUpdating}] = useUpdateChoreMutation();
  const [updateTask, {isLoading: isUpdatingTask}] = useUpdateTaskMutation();
  const [addPoints, {isLoading: isAdding}] = useAddPointsMutation();
  const router = useRouter();
  const session = useSession();
  const {showToast} = useToast();
  const [state, setState] = React.useState<number>(0);
  const tableRef = React.createRef<RewardsTableHandle>();

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

  const rewardChores = (_chores: TaskChoreVM[]) => {
    Promise.all(
      _chores.map(async (chore) => {
        const {task, chore: _chore} = chore;
        const paidDate = new Date();
        return await updateTask({_id: task._id, paidDate}).unwrap();
      })
    )
      .then(() => {
        showToast(`Successfully rewarded chores`, "success");
      })
      .catch((error) => {
        showToast(error.data.message, "error");
      });
  };

  return (
    <ChoreLayout
      isLoading={isUpdatingTask}
      avatar={<ChoreMeAvatar name={session.data?.user?.name ?? "Unknow"}/>}
      title="Rewards"
    >
      <Stack direction={"row"}>
        <Container>
          <FormControl variant="standard" sx={{m: 1, minWidth: 120, flex: 1}}>
            <InputLabel id="demo-simple-select-standard-label">
              Child
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={state}
              onChange={(e) => {
                // console.log(e.target.value);
                e.target.value && setState(Number(e.target.value));
              }}
              label="Child"
            >
              {users.map((user, index) => (
                <MenuItem key={user.profile._id} value={index}>
                  {user.profile.firstName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Container>
        <Container>
          <Typography variant="h5">Owed</Typography>
          {users.map((user, index) => (
            <Typography variant="h5" key={user.profile.id+index}>
              {user.profile.firstName}: {user.owed}
            </Typography>
          ))}
        </Container>
      </Stack>
      <RewardsTable
        data={users[state]}
        ref={tableRef}
        rejecter={choreRejecter}
      />
      <Stack flexDirection={"row"}>
        <NormalButton
          variant="contained"
          color="primary"
          sx={{flex: 1}}
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
          sx={{flex: 1}}
          onClick={() => {
            rewardChores(users[state].tasks);
          }}
        >
          <Typography variant="button">Reward All</Typography>
        </NormalButton>
        <NormalButton
          variant="contained"
          color="primary"
          sx={{flex: 1}}
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
  users: UserTaskData[];
};

export const getServerSideProps: GetServerSideProps<StaticProps> = async (
  context
) => {
  await dbConnect();
  //Check existing
  const userProfiles = (
    await User.find({role: {$eq: Role.CHILDREN}}).exec()
  ).map((doc) => {
    const json = doc.toJSON<MongoDocument<IUser>>();

    return JSON.parse(JSON.stringify(json)) as MongoDocument<IUser>;
  });

  const users: UserTaskData[] = await Promise.all(
    userProfiles.map(async (user) => {
      const finishedTasks = (await Task.find({
        owner: new ObjectId(user._id),
        status: TaskStatus.Finished,
        paidDate: {$exists: false},
      }).exec()).map((doc) => JSON.parse(JSON.stringify(doc)) as MongoDocument<ITask>)

      return {
        profile: user,
        owed: await getUserOwed(user._id),
        tasks: await getTaskChore(finishedTasks),
      };
    })
  );

  return {
    props: {
      users,
    },
  };
};
