import { IResolverObject } from "apollo-server-micro";
import { GraphQLScalarType, Kind } from "graphql";
import TurndownService from "turndown";
import fetchOpenLDBWS from "./fetchOpenLDBWS";
import { GetStationBoardResult } from "./interfaces";

const turndownService = new TurndownService();

function isCRS(value: unknown): value is string {
  return typeof value === "string" && /^[A-Z]{3}$/.test(value);
}

const CRS = new GraphQLScalarType({
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
});

function isPositive(value: unknown): value is number {
  return typeof value === "number" && value >= 1;
}

const Positive = new GraphQLScalarType({
  name: "Positive",
  description: "An integer greater than 0.",

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
});

function isTimeOffset(value: unknown): value is number {
  return typeof value === "number" && value >= -120 && value <= 119;
}

const TimeOffset = new GraphQLScalarType({
  name: "TimeOffset",
  description: "An integer in the interval [-120..119].",

  serialize(value: unknown): number | void {
    if (isTimeOffset(value)) {
      return value;
    }
  },

  parseValue(value: unknown): number | void {
    if (isTimeOffset(value)) {
      return value;
    }
  },

  parseLiteral(valueNode): number | void {
    if (valueNode.kind === Kind.INT) {
      const value = parseInt(valueNode.value, 10);

      if (isTimeOffset(value)) {
        return value;
      }
    }
  },
});

function isTimeWindow(value: unknown): value is number {
  return typeof value === "number" && value >= 1 && value <= 120;
}

const TimeWindow = new GraphQLScalarType({
  name: "TimeWindow",
  description: "An integer in the interval [1..120].",

  serialize(value: unknown): number | void {
    if (isTimeWindow(value)) {
      return value;
    }
  },

  parseValue(value: unknown): number | void {
    if (isTimeWindow(value)) {
      return value;
    }
  },

  parseLiteral(valueNode): number | void {
    if (valueNode.kind === Kind.INT) {
      const value = parseInt(valueNode.value, 10);

      if (isTimeWindow(value)) {
        return value;
      }
    }
  },
});

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && value.getTime() > 0;
}

const Date_ = new GraphQLScalarType({
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
});

const Message = new GraphQLScalarType({
  name: "Message",
  description: "A service information message in Markdown.",

  serialize(value: unknown): string | void {
    if (typeof value === "string") {
      return turndownService.turndown(value);
    }
  },
});

const Query: IResolverObject<never, never, Record<string, unknown>> = {
  async station(_, params) {
    console.log(params);
    const response = await fetchOpenLDBWS("GetArrivalDepartureBoard", params);

    return response.$(GetStationBoardResult, "GetStationBoardResult");
  },
};

export { CRS, Positive, TimeOffset, TimeWindow, Date_ as Date, Message, Query };
