import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";
import { SignUpResponse } from "../../../types/dto";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignUpResponse>
) {
  //Only POST method is accepted
  if (req.method === "POST") {
    //Getting email and password from body
    const { email, password } = req.body;
    //Validate
    if (!email || !email.includes("@") || !password) {
      res.status(422).json({ message: "Invalid Data" });
      return;
    }
    //Connect with database
    const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}:27017/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
    const client = new MongoClient(url, {
      //@ts-ignore
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db();
    //Check existing
    const checkExisting = await db
      .collection("users")
      .findOne({ email: email });
    //Send error response if duplicate user is found
    if (checkExisting) {
      res.status(409).json({ message: "User already exists" });
      await client.close();
      return;
    }
    //Hash password
    const status = await db.collection("users").insertOne({
      email,
      password: await hash(password, 12),
    });
    //Send success response
    res.status(201).json({ message: "User created", ...status });
    //Close DB connection
    await client.close();
  } else {
    //Response for other than POST method
    res.status(500).json({ message: "Route not valid" });
  }
}

export default handler;
