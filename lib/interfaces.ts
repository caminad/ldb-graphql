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
  filterLocationName() {
    return this.$text("filterLocationName");
  }
  filtercrs() {
    return this.$text("filtercrs");
  }
  filterType() {
    return this.$text("filterType");
  }
  nrccMessages() {
    return this.$(NrccMessages, "nrccMessages");
  }
  platformAvailable() {
    return this.$text("platformAvailable") === "true";
  }
  areServicesAvailable() {
    // None implies true.
    return this.$text("areServicesAvailable") !== "false";
  }
  trainServices() {
    return this.$(Services, "trainServices");
  }
  busServices() {
    return this.$(Services, "busServices");
  }
  ferryServices() {
    return this.$(Services, "ferryServices");
  }
}

class NrccMessages extends WrappedXML {
  [Symbol.iterator]() {
    return this.$$text("message");
  }
}

class Services extends WrappedXML {
  [Symbol.iterator]() {
    return this.$$(ServiceItem, "service");
  }
}

class ServiceItem extends WrappedXML {
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
  isCircularRoute() {
    return this.$text("isCircularRoute") === "true";
  }
  isCancelled() {
    return this.$text("isCancelled") === "true";
  }
  filterLocationCancelled() {
    return this.$text("filterLocationCancelled") === "true";
  }
  serviceType() {
    return this.$text("serviceType");
  }
  length() {
    return this.$text("length");
  }
  detachFront() {
    return this.$text("detachFront") === "true";
  }
  isReverseFormation() {
    return this.$text("isReverseFormation") === "true";
  }
  cancelReason() {
    return this.$text("cancelReason");
  }
  delayReason() {
    return this.$text("delayReason");
  }
  adhocAlerts() {
    return this.$text("adhocAlerts");
  }
  serviceID() {
    return this.$text("serviceID");
  }
  rsid() {
    return this.$text("rsid");
  }
  origin() {
    return this.$(ServiceLocations, "origin");
  }
  destination() {
    return this.$(ServiceLocations, "destination");
  }
  currentOrigins() {
    return this.$(ServiceLocations, "currentOrigins");
  }
  currentDestinations() {
    return this.$(ServiceLocations, "currentDestinations");
  }
  formation() {
    return this.$(FormationData, "formation");
  }
}

class ServiceLocations extends WrappedXML {
  [Symbol.iterator]() {
    return this.$$(ServiceLocation, "location");
  }
}

class ServiceLocation extends WrappedXML {
  locationName() {
    return this.$text("locationName");
  }
  crs() {
    return this.$text("crs");
  }
  via() {
    return this.$text("via");
  }
  futureChangeTo() {
    return this.$text("futureChangeTo");
  }
  assocIsCancelled() {
    return this.$text("assocIsCancelled") === "true";
  }
}

class FormationData extends WrappedXML {
  avgLoading() {
    return this.$text("avgLoading");
  }
  coaches() {
    return this.$(CoachData, "coaches");
  }
}

class CoachData extends WrappedXML {
  coachClass() {
    return this.$text("coachClass");
  }
  loading() {
    return this.$text("loading");
  }
  number() {
    return this.$text("number");
  }
  toilet() {
    return this.$(ToiletAvailabilityType, "toilet");
  }
}

class ToiletAvailabilityType extends WrappedXML {
  status() {
    return this.$text("status");
  }

  value() {
    return this.$text("value");
  }
}
