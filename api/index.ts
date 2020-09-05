import { graphqlHTTP } from "express-graphql";
import { IncomingMessage, ServerResponse } from "http";
import schema from "../lib/schema";

function withCors(fn: (req: IncomingMessage, res: ServerResponse) => void) {
  // See https://vercel.com/knowledge/how-to-enable-cors
  return (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    );
    res.setHeader("Access-Control-Max-Age", 86400);
    if (req.method === "OPTIONS") {
      res.end();
    } else {
      fn(req, res);
    }
  };
}

export default withCors(
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  }),
);
