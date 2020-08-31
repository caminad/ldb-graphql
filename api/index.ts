import { ApolloServer, gql } from "apollo-server-micro";
import { decodeXML } from "entities";
import fetch, { RequestInit } from "node-fetch";
import TurndownService from "turndown";
import { convert, create } from "xmlbuilder2";
import { ParserOptions } from "xmlbuilder2/lib/interfaces";

const turndownService = new TurndownService();

function SoapRequest(props: {
  header: Record<string, unknown>;
  body: Record<string, unknown>;
}): RequestInit {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/soap+xml; charset=utf-8",
    },
    body: convert({
      "soap:Envelope": {
        "@xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
        "soap:Header": props.header,
        "soap:Body": props.body,
      },
    }),
  };
}

const ldbwsResponseParserOptions: ParserOptions = {
  attribute(parent) {
    // Skip all attributes.
    return parent;
  },

  element(parent, _namespace, name) {
    if (name.startsWith("soap:") || name.endsWith("Response")) {
      // Un-nest response wrappers.
      return parent;
    }

    // Remove namespace aliases from element names.
    name = name.slice(name.indexOf(":") + 1);

    return parent.ele(name);
  },

  text(parent, data) {
    if (parent.node.nodeName === "message") {
      // Decode &lt;A&gt; to <A>.
      data = decodeXML(data);

      // Ensure links use HTTPS.
      data = data.replace(/http:/g, "https:");

      // Replace html links and paragraphs with markdown.
      data = turndownService.turndown(data);
    }

    return parent.txt(data);
  },
};

const apolloServer = new ApolloServer({
  typeDefs: gql`
    type Query {
      GetArrivalDepartureBoard(crs: String!, numRows: Int!): String!
    }
  `,

  resolvers: {
    Query: {
      async GetArrivalDepartureBoard(_parent, args, _context) {
        const url = "https://realtime.nationalrail.co.uk/OpenLDBWS/ldb11.asmx";

        const init = SoapRequest({
          header: {
            AccessToken: {
              TokenValue: process.env.LDB_TOKEN,
            },
          },

          body: {
            "@xmlns": "http://thalesgroup.com/RTTI/2017-10-01/ldb/",
            GetArrivalDepartureBoardRequest: args,
          },
        });

        const res = await fetch(url, init);

        const xmlString = await res.text();

        const doc = create({ parser: ldbwsResponseParserOptions }, xmlString);

        return doc.end({ format: "json", group: true });
      },
    },
  },

  introspection: true,
  playground: true,
});

export default apolloServer.createHandler({
  path: "/api",
});
