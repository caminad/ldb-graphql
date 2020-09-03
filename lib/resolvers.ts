import { IResolvers } from "apollo-server-micro";
import { GraphQLScalarType, Kind } from "graphql";
import TurndownService from "turndown";
import fetchOpenLDBWS from "./fetchOpenLDBWS";
import { GetStationBoardResult } from "./interfaces";

const turndownService = new TurndownService();

function isCRS(value: unknown): value is string {
  return typeof value === "string" && /^[A-Z]{3}$/.test(value);
}

function isPositive(value: unknown): value is number {
  return typeof value === "number" && value > 0;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && value.getTime() > 0;
}

export default {
  CRS: new GraphQLScalarType({
    name: "CRS",
    description: "CRS custom scalar type",

    serialize(value: unknown): string | void {
      if (value === "???" || isCRS(value)) {
        // Missing CRS is represented as ??? in response.
        return value;
      }
    },

    parseValue(value: unknown): string | void {
      if (isCRS(value)) {
        return value;
      }
    },

    parseLiteral(valueNode): string | void {
      if (valueNode.kind === Kind.STRING && isCRS(valueNode.value)) {
        return valueNode.value;
      }
    },
  }),

  Positive: new GraphQLScalarType({
    name: "Positive",
    description: "Positive custom scalar type",

    serialize(value: unknown): number | void {
      if (isPositive(value)) {
        return value;
      }
    },

    parseValue(value: unknown): number | void {
      if (isPositive(value)) {
        return value;
      }
    },

    parseLiteral(valueNode): number | void {
      if (valueNode.kind === Kind.INT) {
        const value = parseInt(valueNode.value, 10);

        if (isPositive(value)) {
          return value;
        }
      }
    },
  }),

  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",

    serialize(value: unknown): Date | void {
      if (typeof value === "string") {
        const date = new Date(value);

        if (isValidDate(date)) {
          return date;
        }
      }
    },
  }),

  Message: new GraphQLScalarType({
    name: "Message",
    description: "A service information message in Markdown.",

    serialize(value: unknown): string | void {
      if (typeof value === "string") {
        return turndownService.turndown(value);
      }
    },
  }),

  Query: {
    async station(_: never, params: Record<string, unknown>) {
      const response = await fetchOpenLDBWS("GetArrivalDepartureBoard", params);

      return response.$(GetStationBoardResult, "GetStationBoardResult");
    },
  },
} as IResolvers;
