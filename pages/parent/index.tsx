import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import type { GetServerSideProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChoreMeAvatar } from "../../components/avatar";
import { NormalButton } from "../../components/button";
import { ChoreLayout } from "../../components/layout/ChoreLayout";
import { ChoreMeTable } from "../../components/table";
import dbConnect from "../../lib/db";
import { Chore, User } from "../../models";
import styles from "../../styles/Home.module.css";
import { MongoDocument, Role } from "../../types";
import { ChoreVM, UserVM } from "../../types/vm";

const StyledButtonDiv = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
const StyledTextInputDiv = styled("div")`
  display: flex;
  flex-direction: column;
`;
const StyledLogoDiv = styled("div")`
  display: flex;
  justify-content: center;
`;

const MainStyled = styled("div")`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  max-width: 500px;
`;

const Parent: NextPage<StaticProps> = ({ users, chores }) => {
  const router = useRouter();
  const session = useSession();

  const rows = users.map((user) => {
    const data = {
      id: user._id,
      kid: <ChoreMeAvatar name={user.firstName} />,
      rewards: 0,
    };
    chores.forEach((chore) => {
      if (chore.assignedTo.includes(user._id)) {
        data.rewards += chore.points;
      }
    });
    return data;
  });

  return (
    <ChoreLayout
      avatar={<ChoreMeAvatar name={session.data?.user?.name ?? "Unknow"} />}
      title="Reward Totals"
    >
      <MainStyled>
        <ChoreMeTable rows={rows} />
        <StyledButtonDiv>
          <NormalButton
            variant="contained"
            color="primary"
            onClick={() => {
              router.push("/parent/assigned-chores");
            }}
          >
            <Typography variant="button">Chores</Typography>
          </NormalButton>
          <NormalButton
            variant="contained"
            color="primary"
            onClick={() => {
              router.push("/parent/rewards");
            }}
          >
            <Typography variant="button">Rewards</Typography>
          </NormalButton>
        </StyledButtonDiv>
      </MainStyled>
    </ChoreLayout>
  );
};

export default Parent;

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
