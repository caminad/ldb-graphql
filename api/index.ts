import { graphqlHTTP } from "express-graphql";
import schema from "../lib/schema";

export default graphqlHTTP({
  schema: schema,
  graphiql: true,
});
