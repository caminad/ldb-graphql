import { ApolloServer } from "apollo-server-micro";
import resolvers from "../lib/resolvers";
import typeDefs from "../lib/typeDefs";

const apolloServer = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs: typeDefs,
  resolvers: resolvers,
});

export default apolloServer.createHandler({
  path: "/api",
});
