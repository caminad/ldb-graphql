import WrappedXML from "./WrappedXML";

export class GetStationBoardResult extends WrappedXML {
  generatedAt() {
    return this.$text("generatedAt");
  }
  locationName() {
    return this.$text("locationName");
  }
  crs() {
    return this.$text("crs");
  }
  nrccMessages() {
    return this.$(NrccMessages, "nrccMessages");
  }
  platformAvailable() {
    return this.$text("platformAvailable") === "true";
  }
  trainServices() {
    return this.$(TrainServices, "trainServices");
  }
}

class NrccMessages extends WrappedXML {
  [Symbol.iterator]() {
    return this.$$text("message");
  }
}

class TrainServices extends WrappedXML {
  [Symbol.iterator]() {
    return this.$$(Service, "service");
  }
}

class Service extends WrappedXML {
  sta() {
    return this.$text("sta");
  }
  eta() {
    return this.$text("eta");
  }
  std() {
    return this.$text("std");
  }
  etd() {
    return this.$text("etd");
  }
  platform() {
    return this.$text("platform");
  }
  operator() {
    return this.$text("operator");
  }
  operatorCode() {
    return this.$text("operatorCode");
  }
  serviceType() {
    return this.$text("serviceType");
  }
  serviceID() {
    return this.$text("serviceID");
  }
  rsid() {
    return this.$text("rsid");
  }
  origin() {
    return this.$(Origin, "origin");
  }
  destination() {
    return this.$(Destination, "destination");
  }
}

class Origin extends WrappedXML {
  [Symbol.iterator]() {
    return this.$$(Location, "location");
  }
}

class Destination extends WrappedXML {
  [Symbol.iterator]() {
    return this.$$(Location, "location");
  }
}

class Location extends WrappedXML {
  locationName() {
    return this.$text("locationName");
  }
  crs() {
    return this.$text("crs");
  }
  via() {
    return this.$text("via");
  }
}
