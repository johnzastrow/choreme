import {Typography} from "@mui/material";
import {styled} from "@mui/system";
import type {GetServerSideProps, NextPage} from "next";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {ChoreMeAvatar} from "../../components/avatar";
import {NormalButton} from "../../components/button";
import {ChoreLayout} from "../../components/layout";
import {ChoreMeTable} from "../../components/table";
import dbConnect from "../../lib/db";
import {IUser, User} from "../../models";
import {MongoDocument, Role} from "../../types";
import {getUserRewards} from "../../lib/task.service";

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

const Parent: NextPage<StaticProps> = ({users}) => {
  const router = useRouter();
  const session = useSession();

  const rows = users.map((user) => ({
        id: user.profile._id,
        kid: <ChoreMeAvatar name={user.profile.firstName}/>,
        rewards: user.rewards,
      }
    ))
  ;

  return (
    <ChoreLayout
      avatar={<ChoreMeAvatar name={session.data?.user?.name ?? "Unknow"}/>}
      title="Reward Totals"
    >
      <MainStyled>
        <ChoreMeTable rows={rows}/>
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
  users: { rewards: number, profile: MongoDocument<IUser> }[]
};

export const getServerSideProps: GetServerSideProps<StaticProps> = async (
  context
) => {
  await dbConnect();
  //Check existing
  const users = await Promise.all((await User.find({role: {$eq: Role.CHILDREN}}).exec())
    .map(async (user) => {
      return {
        profile: JSON.parse(JSON.stringify(user.toJSON<MongoDocument<IUser>>())) as MongoDocument<IUser>,
        rewards: await getUserRewards(user._id),
      };
    }));

  return {
    props: {
      users,
    },
  };
};
