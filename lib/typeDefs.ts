import { gql } from "apollo-server-micro";

export default gql`
  scalar CRS
  scalar Positive
  scalar Date
  scalar Message

  type Query {
    station(crs: CRS!, numRows: Positive!): GetStationBoardResult!
  }

  type GetStationBoardResult {
    _xml: String!
    generatedAt: Date!
    locationName: String!
    crs: CRS!
    nrccMessages: [Message!]
    platformAvailable: Boolean!
    trainServices: [Service!]
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
    origin: [Location!]!
    destination: [Location!]!
  }

  type Location {
    _xml: String!
    locationName: String!
    crs: CRS!
    via: String
  }
`;
