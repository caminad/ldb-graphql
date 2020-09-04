import { GraphQLNonNull, GraphQLObjectType, GraphQLSchema } from "graphql";
import fetchOpenLDBWS from "./fetchOpenLDBWS";
import { FilterType } from "./type/enums";
import { GetStationBoardResult } from "./type/objects";
import { CRS, PositiveInt, TimeOffset, TimeWindow } from "./type/scalars";

export default new GraphQLSchema({
  query: new GraphQLObjectType<unknown, unknown>({
    name: "Query",

    fields: {
      station: {
        type: new GraphQLNonNull(GetStationBoardResult),

        description:
          "Returns all public arrivals and departures for the supplied CRS code within a defined time window. See <https://realtime.nationalrail.co.uk/OpenLDBWS/#GetArrivalDepartureBoardHeader>",

        args: {
          crs: {
            type: new GraphQLNonNull(CRS),
            description:
              "The CRS code of the location for which the request is being made.",
          },

          numRows: {
            type: PositiveInt,
            description:
              "The number of services to return in the resulting station board.",
          },

          filterCrs: {
            type: CRS,
            description:
              "The CRS code of either an origin or destination location to filter in.",
          },

          filterType: {
            type: FilterType,
            description:
              'The type of filter to apply. Filters services to include only those originating or terminating at the filterCrs location. Defaults to "to".',
          },

          timeOffset: {
            type: TimeOffset,
            description:
              "An offset in minutes against the current time to provide the station board for. Defaults to 0.",
          },

          timeWindow: {
            type: TimeWindow,
            description:
              "How far into the future in minutes, relative to timeOffset, to return services for. Defaults to 120.",
          },
        },

        resolve: async (_, args) => {
          const xml = await fetchOpenLDBWS("GetArrivalDepartureBoard", args);

          return xml.$("GetStationBoardResult");
        },
      },
    },
  }),
});
