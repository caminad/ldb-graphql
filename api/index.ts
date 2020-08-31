import { ApolloServer, gql } from "apollo-server-micro";

const apolloServer = new ApolloServer({
  typeDefs: gql`
    type Query {
      sayHello(to: String!): String!
    }
  `,
  resolvers: {
    Query: {
      sayHello(_parent, args, _context) {
        return `Hello ${args.to}!`;
      },
    },
  },
  introspection: true,
  playground: true,
});

export default apolloServer.createHandler({
  path: "/api",
});
