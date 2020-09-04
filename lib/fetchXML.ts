import https, { RequestOptions } from "https";
import { DOMImplementation, DOMParser, XMLSerializer } from "xmldom";
import WrappedXML from "./WrappedXML";

const SOAP_NS = "http://www.w3.org/2003/05/soap-envelope";
const LDB_NS = "http://thalesgroup.com/RTTI/2017-10-01/ldb/";

export default async function fetchXML(
  operation: string,
  params: Record<string, unknown>,
): Promise<WrappedXML> {
  const requestDoc = buildRequestDoc(operation + "Request", params);

  const responseDoc = await request(requestDoc);

  const responseBody = getResponseBody(responseDoc);

  return new WrappedXML(responseBody);
}

function buildRequestDoc(
  requestType: string,
  params: Record<string, unknown>,
): Document {
  const doc = new DOMImplementation().createDocument(
    SOAP_NS,
    "soap:Envelope",
    null,
  );
  const header = doc.documentElement.appendChild(
    doc.createElementNS(SOAP_NS, "soap:Header"),
  );
  const body = doc.documentElement.appendChild(
    doc.createElementNS(SOAP_NS, "soap:Body"),
  );

  if (process.env.LDB_TOKEN) {
    header
      .appendChild(doc.createElementNS(null, "AccessToken"))
      .appendChild(doc.createElementNS(null, "TokenValue"))
      .appendChild(doc.createTextNode(process.env.LDB_TOKEN));
  }

  const request = body.appendChild(doc.createElementNS(LDB_NS, requestType));

  for (const [paramName, paramValue] of Object.entries(params)) {
    request
      .appendChild(doc.createElementNS(null, paramName))
      .appendChild(doc.createTextNode(String(paramValue)));
  }

  return doc;
}

function request(doc: Document): Promise<Document> {
  const options: RequestOptions = {
    method: "POST",
    hostname: "realtime.nationalrail.co.uk",
    path: "/OpenLDBWS/ldb11.asmx",
    headers: {
      "Content-Type": "application/soap+xml; charset=utf-8",
    },
  };

  return new Promise((resolve) => {
    https
      .request(options, (res) => {
        let content = "";

        res
          .setEncoding("utf-8")
          .on("data", (chunk) => {
            content += chunk;
          })
          .on("close", () => {
            resolve(new DOMParser().parseFromString(content, "text/xml"));
          });
      })
      .end(new XMLSerializer().serializeToString(doc));
  });
}

function getResponseBody(doc: Document): Element {
  if (doc.getElementsByTagNameNS(SOAP_NS, "Fault").length > 0) {
    const xml = new WrappedXML(doc.documentElement);

    throw new Error(
      `Soap Fault (${xml.$text("Code")}): ${xml.$text("Reason")}`,
    );
  }

  return doc.getElementsByTagNameNS(SOAP_NS, "Body")[0];
}
