import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import { compare } from "bcryptjs";
import { LoginVM } from "../../../types/vm";

export default NextAuth({
  //Configure JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 60 * 60 * 24 * 7, //1 week
  },
  secret: process.env.JWT_SECRET,
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.id = token.id;
        session.role = token.role;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      // Allows relative callback URLs
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  //Specify Provider
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "enter you email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: LoginVM) {
        if (!credentials) {
          throw new Error("Credentail is undefined");
        }
        //Connect to DB
        const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}:27017/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
        const client = new MongoClient(url, {
          // @ts-ignore
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        await client.connect();

        //Get all the users
        const users = client.db().collection("users");
        //Find user with the email
        const result = await users.findOne({
          email: credentials.email,
        });
        //Not found - send error res
        if (!result) {
          await client.close();
          throw new Error("No user found with the email");
        }
        //Check hased password with DB password
        let checkPassword;
        try {
          checkPassword = await compare(credentials.password, result.password);
        } catch (e) {
          console.log(e);
          throw new Error("Password is incorrect");
        }
        //Incorrect password - send response
        if (!checkPassword) {
          await client.close();
          throw new Error("Password doesnt match");
        }
        //Else send success response
        await client.close();
        return {
          email: result.email,
          role: result.role,
          name: result.firstName,
        };
      },
    }),
  ],
});
