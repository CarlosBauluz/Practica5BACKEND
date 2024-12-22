import { Collection, MongoClient } from "mongodb"
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import { GraphQLError } from "graphql";
import { Comment, Post, User } from "./types.ts";

const URL = Deno.env.get("URL")
if(!URL) throw new GraphQLError("MONGO URL NOT EXISTS")

const client = new MongoClient(URL)
await client.connect()
console.log("Conectado a la base de datos")

const db = client.db("SocialMedia")

const userCollection = db.collection<User>("User")
const postCollection = db.collection<Post>("Post")
const commentCollection = db.collection<Comment>("Comment")

const server = new ApolloServer({typeDefs : schema, resolvers})

const { url } = await startStandaloneServer(server,{
  context: async() => ({ userCollection, postCollection, commentCollection })
})

console.log(`🚀  Server ready at: ${url}`);