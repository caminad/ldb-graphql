import { IResolverObject } from "apollo-server-micro";
import TurndownService from "turndown";
import fetchOpenLDBWS from "./fetchOpenLDBWS";

const turndownService = new TurndownService();

type Resolvers = IResolverObject<Element, unknown>;

export const Query: Resolvers = {
  async services(_, args) {
    const body = await fetchOpenLDBWS("GetArrivalDepartureBoard", args);
    return body?.getElementsByTagName("GetStationBoardResult")[0];
  },
};

export const GetStationBoardResult: Resolvers = {
  _xml(element) {
    return String(element);
  },

  generatedAt(element) {
    return element.getElementsByTagNameNS("*", "generatedAt")[0]?.textContent;
  },

  locationName(element) {
    return element.getElementsByTagNameNS("*", "locationName")[0]?.textContent;
  },

  crs(element) {
    return element.getElementsByTagNameNS("*", "crs")[0]?.textContent;
  },

  nrccMessages(element) {
    return Array.from(
      element
        .getElementsByTagNameNS("*", "nrccMessages")[0]
        ?.getElementsByTagNameNS("*", "message") ?? [],
      (el) => el.textContent && turndownService.turndown(el.textContent),
    );
  },

  platformAvailable(element) {
    return (
      element.getElementsByTagNameNS("*", "platformAvailable")[0]
        ?.textContent === "true"
    );
  },

  trainServices(element) {
    return element
      .getElementsByTagNameNS("*", "trainServices")[0]
      ?.getElementsByTagNameNS("*", "service");
  },
};

export const Service: Resolvers = {
  _xml(element) {
    return String(element);
  },

  sta(element) {
    return element.getElementsByTagNameNS("*", "sta")[0]?.textContent;
  },

  eta(element) {
    return element.getElementsByTagNameNS("*", "eta")[0]?.textContent;
  },

  std(element) {
    return element.getElementsByTagNameNS("*", "std")[0]?.textContent;
  },

  etd(element) {
    return element.getElementsByTagNameNS("*", "etd")[0]?.textContent;
  },

  platform(element) {
    return element.getElementsByTagNameNS("*", "platform")[0]?.textContent;
  },

  operator(element) {
    return element.getElementsByTagNameNS("*", "operator")[0]?.textContent;
  },

  operatorCode(element) {
    return element.getElementsByTagNameNS("*", "operatorCode")[0]?.textContent;
  },

  serviceType(element) {
    return element.getElementsByTagNameNS("*", "serviceType")[0]?.textContent;
  },

  serviceID(element) {
    return element.getElementsByTagNameNS("*", "serviceID")[0]?.textContent;
  },

  rsid(element) {
    return element.getElementsByTagNameNS("*", "rsid")[0]?.textContent;
  },

  origin(element) {
    return element.getElementsByTagNameNS("*", "origin")[0];
  },

  destination(element) {
    return element.getElementsByTagNameNS("*", "destination")[0];
  },
};

export const Location: Resolvers = {
  locationName(element) {
    return element.getElementsByTagNameNS("*", "locationName")[0]?.textContent;
  },

  crs(element) {
    return element.getElementsByTagNameNS("*", "crs")[0]?.textContent;
  },
};
