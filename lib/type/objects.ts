import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import WrappedXML from "../WrappedXML";
import { FilterType, ToiletStatus, ToiletType } from "./enums";
import { CRS, DateTime, Message } from "./scalars";

const ServiceLocation = new GraphQLObjectType<WrappedXML>({
  name: "ServiceLocation",

  fields: {
    locationName: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The name of the location.",
      resolve: (xml) => xml.$text("locationName"),
    },

    crs: {
      type: new GraphQLNonNull(CRS),
      description:
        "The CRS code of this location. A CRS code of ??? indicates an error situation where no crs code is known for this location.",
      resolve: (xml) => xml.$text("crs"),
    },

    via: {
      type: GraphQLString,
      description:
        "An optional via text that should be displayed after the location, to indicate further information about an ambiguous route. Note that vias are only present for ServiceLocation objects that appear in destination lists.",
      resolve: (xml) => xml.$text("via"),
    },

    futureChangeTo: {
      type: GraphQLString,
      description:
        "A text string contianing service type (Bus/Ferry/Train) to which will be changed in the future.",
      resolve: (xml) => xml.$text("futureChangeTo"),
    },

    assocIsCancelled: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        "This origin or destination can no longer be reached because the association has been cancelled.",
      resolve: (xml) => xml.$text("assocIsCancelled") === "true",
    },
  },
});

const ToiletAvailabilityType = new GraphQLObjectType<WrappedXML>({
  name: "ToiletAvailabilityType",

  fields: {
    status: {
      type: ToiletStatus,
      description:
        "ToiletStatus enumeration (Unknown, InService, NotInService), indicating service status",
      resolve: (xml) => xml.$("status"),
    },

    value: {
      type: ToiletType,
      description: "Type of toilet (Unknown, None, Standard, Accessible)",
      resolve: (xml) => xml.$("value"),
    },
  },
});

const CoachData = new GraphQLObjectType<WrappedXML>({
  name: "CoachData",

  fields: {
    coachClass: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        "The class of coach, where known. First, Mixed or Standard. Other classes may be introduced in the future.",
      resolve: (xml) => xml.$text("coachClass"),
    },

    loading: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The loading value (0-100) for the coach.",
      resolve: (xml) => xml.$text("loading"),
    },

    number: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The number/identifier for this coach, e.g. "A" or "12". Maximum of two characters.',
      resolve: (xml) => xml.$text("number"),
    },

    toilet: {
      type: new GraphQLNonNull(ToiletAvailabilityType),
      description:
        "A ToiletAvailabilityType object representing toilet data. (2017-10-01 schema onwards)",
      resolve: (xml) => xml.$("toilet"),
    },
  },
});

const FormationData = new GraphQLObjectType<WrappedXML>({
  name: "FormationData",

  fields: {
    avgLoading: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The average loading value for this formation.",
      resolve: (xml) => xml.$text("avgLoading"),
    },

    coaches: {
      type: new GraphQLNonNull(GraphQLList(new GraphQLNonNull(CoachData))),
      description:
        "A collection of CoachData objects related to this formation.",
      resolve: (xml) => xml.$("coaches")?.$$("coach"),
    },
  },
});

const ServiceItem = new GraphQLObjectType<WrappedXML>({
  name: "ServiceItem",

  fields: {
    sta: {
      type: GraphQLString,
      description:
        "An optional Scheduled Time of Arrival of the service at the station board location. Arrival times will only be available for Arrival and Arrival & Departure station boards but may also not be present at locations that are not scheduled to arrive at the location (e.g. the origin).",
      resolve: (xml) => xml.$text("sta"),
    },

    eta: {
      type: GraphQLString,
      description:
        "An optional Estimated Time of Arrival of the service at the station board location. Arrival times will only be available for Arrival and Arrival & Departure station boards and only where an sta time is present.",
      resolve: (xml) => xml.$text("eta"),
    },

    std: {
      type: GraphQLString,
      description:
        "An optional Scheduled Time of Departure of the service at the station board location. Departure times will only be available for Departure and Arrival & Departure station boards but may also not be present at locations that are not scheduled to depart at the location (e.g. the destination).",
      resolve: (xml) => xml.$text("std"),
    },

    etd: {
      type: GraphQLString,
      description:
        "An optional Estimated Time of Departure of the service at the station board location. Departure times will only be available for Departure and Arrival & Departure station boards and only where an std time is present.",
      resolve: (xml) => xml.$text("etd"),
    },

    platform: {
      type: GraphQLString,
      description:
        "An optional platform number for the service at this location. This will only be present where available and where the station board platformAvailable value is `true`.",
      resolve: (xml) => xml.$text("platform"),
    },

    operator: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        "The name of the Train Operating Company that operates the service.",
      resolve: (xml) => xml.$text("operator"),
    },

    operatorCode: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        "The code of the Train Operating Company that operates the service.",
      resolve: (xml) => xml.$text("operatorCode"),
    },

    isCircularRoute: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        "If this value is present and has the value `true` then the service is operating on a circular route through the network and will call again at this location later on its journey. The user interface should indicate this fact to the user, to help them choose the correct service from a set of similar alternatives.",
      resolve: (xml) => xml.$text("isCircularRoute") === "true",
    },

    isCancelled: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        "A flag to indicate that this service is cancelled at this location.",
      resolve: (xml) => xml.$text("isCancelled") === "true",
    },

    filterLocationCancelled: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        "A flag to indicate that this service is no longer stopping at the requested from/to filter location.",
      resolve: (xml) => xml.$text("filterLocationCancelled") === "true",
    },

    serviceType: {
      type: GraphQLString,
      description:
        "The type of service (train, bus, ferry) that this item represents. Note that real-time information (e.g. eta, etd, ata, atd, isCancelled, etc.) is only available and present for train services.",
      resolve: (xml) => xml.$text("serviceType"),
    },

    length: {
      type: GraphQLInt,
      description:
        "The train length (number of units) at this location. If not supplied, or zero, the length is unknown.",
      resolve: (xml) => xml.$text("length"),
    },

    detachFront: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        "True if the service detaches units from the front at this location.",
      resolve: (xml) => xml.$text("detachFront") === "true",
    },

    isReverseFormation: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        "True if the service is operating in the reverse of its normal formation.",
      resolve: (xml) => xml.$text("isReverseFormation") === "true",
    },

    cancelReason: {
      type: GraphQLString,
      description: "A cancellation reason for this service.",
      resolve: (xml) => xml.$text("cancelReason"),
    },

    delayReason: {
      type: GraphQLString,
      description: "A delay reason for this service.",
      resolve: (xml) => xml.$text("delayReason"),
    },

    adhocAlerts: {
      type: GraphQLString,
      description:
        "A list of Adhoc Alerts related to this location for this service. This list contains an object called `AdhocAlertTextType` which contains a string to show the Adhoc Alert Text for the location.",
      resolve: (xml) => xml.$text("adhocAlerts"),
    },

    serviceID: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        "The unique service identifier of this service relative to the station board on which it is displayed. This value can be passed to GetServiceDetails to obtain the full details of the individual service.",
      resolve: (xml) => xml.$text("serviceID"),
    },

    rsid: {
      type: GraphQLString,
      description: "The Retail Service ID of the service, if known.",
      resolve: (xml) => xml.$text("GraphQLString"),
    },

    origin: {
      type: new GraphQLList(new GraphQLNonNull(ServiceLocation)),
      description:
        "A list of `ServiceLocation` objects giving original origins of this service. Note that a service may have more than one original origin, if the service comprises of multiple trains that join at a previous location in the schedule. Original Origins will only be available for Arrival and Arrival & Departure station boards.",
      resolve: (xml) => xml.$("origin")?.$$("location"),
    },

    destination: {
      type: new GraphQLList(new GraphQLNonNull(ServiceLocation)),
      description:
        "A list of `ServiceLocation` objects giving original destinations of this service. Note that a service may have more than one original destination, if the service comprises of multiple trains that divide at a subsequent location in the schedule. Original Destinations will only be available for Departure and Arrival & Departure station boards.",
      resolve: (xml) => xml.$("destination")?.$$("location"),
    },

    currentOrigins: {
      type: new GraphQLList(new GraphQLNonNull(ServiceLocation)),
      description:
        "An optional list of `ServiceLocation` objects giving live/current origins of this service which is not starting at original cancelled origins. Note that a service may have more than one live origin. if the service comprises of multiple trains that join at a previous location in the schedule. Live Origins will only be available for Arrival and Arrival & Departure station boards.",
      resolve: (xml) => xml.$("currentOrigins")?.$$("location"),
    },

    currentDestinations: {
      type: new GraphQLList(new GraphQLNonNull(ServiceLocation)),
      description:
        "An optional list of `ServiceLocation` objects giving live/current destinations of this service which is not ending at original cancelled destinations. Note that a service may have more than one live destination, if the service comprises of multiple trains that divide at a subsequent location in the schedule. Live Destinations will only be available for Departure and Arrival & Departure station boards.",
      resolve: (xml) => xml.$("currentDestinations")?.$$("location"),
    },

    formation: {
      type: FormationData,
      description: "FormationData for this ServiceItem, if any.",
      resolve: (xml) => xml.$("formation"),
    },
  },
});

export const GetStationBoardResult = new GraphQLObjectType<WrappedXML>({
  name: "GetStationBoardResult",

  fields: {
    generatedAt: {
      type: new GraphQLNonNull(DateTime),
      description: "The time at which the station board was generated.",
      resolve: (xml) => xml.$text("generatedAt"),
    },

    locationName: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The name of the location that the station board is for.",
      resolve: (xml) => xml.$text("locationName"),
    },

    crs: {
      type: new GraphQLNonNull(CRS),
      description:
        "The CRS code of the location that the station board is for.",
      resolve: (xml) => xml.$text("crs"),
    },

    filterLocationName: {
      type: GraphQLString,
      description:
        "If a filter was requested, the location name of the filter location.",
      resolve: (xml) => xml.$text("filterLocationName"),
    },

    filtercrs: {
      type: GraphQLString,
      description:
        "If a filter was requested, the CRS code of the filter location.",
      resolve: (xml) => xml.$text("filtercrs"),
    },

    filterType: {
      type: FilterType,
      description: "If a filter was requested, the type of filter.",
      resolve: (xml) => xml.$text("filterType"),
    },

    nrccMessages: {
      type: new GraphQLList(new GraphQLNonNull(Message)),
      description:
        "An optional list of textual messages that should be displayed with the station board. The message may include embedded and xml encoded HTML-like hyperlinks and paragraphs. The messages are typically used to display important disruption information that applies to the location that the station board was for. Any embedded <p> tags are used to force a new-line in the output. Embedded <a> tags allow links to external web pages that may provide more information. Output channels that do not support HTML should strip out the <a> tags and just leave the enclosed text.",
      resolve: (xml) => xml.$("nrccMessages")?.$$text("message"),
    },

    platformAvailable: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        'An optional value that indicates if platform information is available. If this value is present with the value `true` then platform information will be returned in the service lists. If this value is not present, or has the value `false`, then the platform "heading" should be suppressed in the user interface for this station board.',
      resolve: (xml) => xml.$text("platformAvailable") === "true",
    },

    areServicesAvailable: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        "An optional value that indicates if services are currently available for this station board. If this value is present with the value `false` then no services will be returned in the service lists. This value may be set, for example, if access to a station has been closed to the public at short notice, even though the scheduled services are still running. It would be usual in such cases for one of the nrccMessages to describe why the list of services has been suppressed.",
      resolve: (xml) => xml.$text("areServicesAvailable") !== "false",
    },

    trainServices: {
      type: new GraphQLList(new GraphQLNonNull(ServiceItem)),
      description:
        "Each of these lists contains a `ServiceItem` object for each service of the relevant type that is to appear on the station board. Each or all of these lists may contain zero items, or may not be present at all.",
      resolve: (xml) => xml.$("trainServices")?.$$("service"),
    },

    busServices: {
      type: new GraphQLList(new GraphQLNonNull(ServiceItem)),
      description:
        "Each of these lists contains a `ServiceItem` object for each service of the relevant type that is to appear on the station board. Each or all of these lists may contain zero items, or may not be present at all.",
      resolve: (xml) => xml.$("busServices")?.$$("service"),
    },

    ferryServices: {
      type: new GraphQLList(new GraphQLNonNull(ServiceItem)),
      description:
        "Each of these lists contains a `ServiceItem` object for each service of the relevant type that is to appear on the station board. Each or all of these lists may contain zero items, or may not be present at all.",
      resolve: (xml) => xml.$("ferryServices")?.$$("service"),
    },
  },
});
