import { IResolverObject } from "apollo-server-micro";
import { Node } from "domhandler";
import { getElementsByTagName, getOuterHTML, getText } from "domutils";
import { decodeXML } from "entities";
import TurndownService from "turndown";
import fetchOpenLDBWS from "./fetchOpenLDBWS";

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

const turndownService = new TurndownService();

type Resolvers = IResolverObject<Node[], unknown>;

export const Query: Resolvers = {
  async services(_, args) {
    const body = await fetchOpenLDBWS("GetArrivalDepartureBoard", args);
    return maybeGetChildren("GetStationBoardResult", body);
  },
};

export const GetStationBoardResult: Resolvers = {
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
};

export const Service: Resolvers = {
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
    return maybeGetChildren("location", maybeGetChildren("destination", nodes));
  },
};

export const Location: Resolvers = {
  locationName(nodes) {
    return maybeGetText(maybeGetChildren("locationName", nodes));
  },

  crs(nodes) {
    return maybeGetText(maybeGetChildren("crs", nodes));
  },
};
