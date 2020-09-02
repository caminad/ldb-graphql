import { gql } from "apollo-server-micro";

export default gql`
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
`;
