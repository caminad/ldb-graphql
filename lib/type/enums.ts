import { GraphQLEnumType } from "graphql";

export const FilterType = new GraphQLEnumType({
  name: "FilterType",
  values: {
    from: {},
    to: {},
  },
});
export const ToiletStatus = new GraphQLEnumType({
  name: "ToiletStatus",
  values: {
    Unknown: {},
    InService: {},
    NotInService: {},
  },
});

export const ToiletType = new GraphQLEnumType({
  name: "ToiletType",
  values: {
    Unknown: {},
    None: {},
    Standard: {},
    Accessible: {},
  },
});
