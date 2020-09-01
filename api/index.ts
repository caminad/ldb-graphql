import { ApolloServer, gql, IResolvers } from "apollo-server-micro";
import { DomHandler, Node } from "domhandler";
import { getElementsByTagName, getOuterHTML, getText } from "domutils";
import { decodeXML } from "entities";
import { Parser } from "htmlparser2";
import fetch, { Request } from "node-fetch";
import TurndownService from "turndown";
import { create } from "xmlbuilder2";
import { XMLBuilder } from "xmlbuilder2/lib/interfaces";

const turndownService = new TurndownService();

interface SoapEnvelopeOptions {
  headers: Record<string, unknown>;
  body: Record<string, unknown>;
}

function SoapEnvelope(options: SoapEnvelopeOptions): XMLBuilder {
  return create({
    "soap:Envelope": {
      "@xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
      "soap:Header": options.headers,
      "soap:Body": options.body,
    },
  });
}

function SoapRequest(endpoint: string, options: SoapEnvelopeOptions): Request {
  return new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/soap+xml; charset=utf-8" },
    body: SoapEnvelope(options).toString(),
  });
}

/**
 * Returns the children of the first element to match. Returns undefined if none matched.
 * Does not recurse into nodes.
 * @param localName The part of the tag name after the “:” to match on.
 * @param nodes List of nodes to search.
 */
function maybeGetChildren(
  localName: string,
  nodes: Node[] | undefined,
): Node[] | undefined {
  if (!nodes) {
    return undefined;
  }

  const [element = undefined] = getElementsByTagName(
    (name: string) => {
      return name.slice(name.indexOf(":") + 1) === localName;
    },
    nodes,
    false,
    1,
  );

  return element?.children;
}

/**
 * Returns the text content of the given nodes. Returns undefined if there is no text.
 * @param nodes None, one, or several nodes to search.
 */
function maybeGetText(nodes: Node | Node[] | undefined): string | undefined {
  if (!nodes) {
    return undefined;
  }

  return getText(nodes) || undefined;
}

function parseBody(content: string): Node[] {
  const handler = new DomHandler();
  const parser = new Parser(handler, { xmlMode: true });

  parser.parseComplete(content);

  const envelope = maybeGetChildren("Envelope", handler.dom);
  const body = maybeGetChildren("Body", envelope);

  if (!body) {
    throw new Error(`Missing response body`);
  }

  const fault = maybeGetChildren("Fault", body);

  if (fault) {
    const code = maybeGetText(maybeGetChildren("Code", fault));
    const reason = decodeXML(
      maybeGetText(maybeGetChildren("Reason", fault)) || "",
    );

    throw new Error(`Soap fault (${code}): ${reason}`);
  }

  return body;
}

export async function fetchOpenLDBWS(
  operation: string,
  params: Record<string, unknown>,
): Promise<Node[] | undefined> {
  const url = "https://realtime.nationalrail.co.uk/OpenLDBWS/ldb11.asmx";

  const request = SoapRequest(url, {
    headers: {
      AccessToken: { TokenValue: process.env.LDB_TOKEN },
    },

    body: {
      "@xmlns": "http://thalesgroup.com/RTTI/2017-10-01/ldb/",
      [operation + "Request"]: params,
    },
  });

  const response = await fetch(request);

  const content = await response.text();

  const body = parseBody(content);

  return maybeGetChildren(operation + "Response", body);
}

const apolloServer = new ApolloServer({
  introspection: true,
  playground: true,

  typeDefs: gql`
    type Query {
      services(crs: String!, numRows: Int!): GetStationBoardResult!
    }

    type GetStationBoardResult {
      _xml: String!

      generatedAt: String!

      locationName: String!

      crs: String!

      nrccMessages: [String!]!

      platformAvailable: Boolean!

      trainServices: [Service!]!
    }

    type Service {
      _xml: String!

      sta: String

      eta: String

      std: String

      etd: String

      platform: String

      operator: String!

      operatorCode: String!

      serviceType: String!

      serviceID: String!

      rsid: String

      origin: Location

      destination: Location
    }

    type Location {
      locationName: String!

      crs: String!
    }
  `,

  resolvers: {
    Query: {
      async services(_, args) {
        const body = await fetchOpenLDBWS("GetArrivalDepartureBoard", args);
        return maybeGetChildren("GetStationBoardResult", body);
      },
    },

    GetStationBoardResult: {
      _xml(nodes) {
        return nodes && getOuterHTML(nodes);
      },

      generatedAt(nodes) {
        return maybeGetText(maybeGetChildren("generatedAt", nodes));
      },

      locationName(nodes) {
        return maybeGetText(maybeGetChildren("locationName", nodes));
      },

      crs(nodes) {
        return maybeGetText(maybeGetChildren("crs", nodes));
      },

      nrccMessages(nodes) {
        const messages = maybeGetChildren("nrccMessages", nodes);
        return messages
          ?.map(getText)
          .map(decodeXML)
          .map((content) => turndownService.turndown(content));
      },

      platformAvailable(nodes) {
        return (
          maybeGetText(maybeGetChildren("platformAvailable", nodes)) === "true"
        );
      },

      trainServices(nodes) {
        const services = maybeGetChildren("trainServices", nodes);
        return services?.map((n) => maybeGetChildren("service", [n]));
      },
    },

    Service: {
      _xml(nodes) {
        return nodes && getOuterHTML(nodes);
      },

      sta(nodes) {
        return maybeGetText(maybeGetChildren("sta", nodes));
      },

      eta(nodes) {
        return maybeGetText(maybeGetChildren("eta", nodes));
      },

      std(nodes) {
        return maybeGetText(maybeGetChildren("std", nodes));
      },

      etd(nodes) {
        return maybeGetText(maybeGetChildren("etd", nodes));
      },

      platform(nodes) {
        return maybeGetText(maybeGetChildren("platform", nodes));
      },

      operator(nodes) {
        return maybeGetText(maybeGetChildren("operator", nodes));
      },

      operatorCode(nodes) {
        return maybeGetText(maybeGetChildren("operatorCode", nodes));
      },

      serviceType(nodes) {
        return maybeGetText(maybeGetChildren("serviceType", nodes));
      },

      serviceID(nodes) {
        return maybeGetText(maybeGetChildren("serviceID", nodes));
      },

      rsid(nodes) {
        return maybeGetText(maybeGetChildren("rsid", nodes));
      },

      origin(nodes) {
        return maybeGetChildren("location", maybeGetChildren("origin", nodes));
      },

      destination(nodes) {
        return maybeGetChildren(
          "location",
          maybeGetChildren("destination", nodes),
        );
      },
    },

    Location: {
      locationName(nodes) {
        return maybeGetText(maybeGetChildren("locationName", nodes));
      },

      crs(nodes) {
        return maybeGetText(maybeGetChildren("crs", nodes));
      },
    },
  } as IResolvers<Node[] | undefined, unknown>,
});

export default apolloServer.createHandler({
  path: "/api",
});
