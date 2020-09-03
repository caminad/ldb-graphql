import fetch, { Request, Response } from "node-fetch";
import { DOMParser } from "xmldom";
import WrappedXML from "./WrappedXML";

const SOAP_NS = "http://www.w3.org/2003/05/soap-envelope";
const LDB_NS = "http://thalesgroup.com/RTTI/2017-10-01/ldb/";

function SoapRequest(
  requestName: string,
  params: Record<string, unknown>,
): Request {
  const dom = new DOMParser().parseFromString('<?xml version="1.0"?>');

  const envelope = dom.appendChild(
    dom.createElementNS(SOAP_NS, "soap:Envelope"),
  );

  const token = envelope
    .appendChild(dom.createElementNS(SOAP_NS, "soap:Header"))
    .appendChild(dom.createElement("AccessToken"))
    .appendChild(dom.createElement("TokenValue"));

  if (process.env.LDB_TOKEN) {
    token.appendChild(dom.createTextNode(process.env.LDB_TOKEN));
  }

  const request = envelope
    .appendChild(dom.createElementNS(SOAP_NS, "soap:Body"))
    .appendChild(dom.createElementNS(LDB_NS, requestName));

  for (const [paramName, paramValue] of Object.entries(params)) {
    request
      .appendChild(dom.createElement(paramName))
      .appendChild(dom.createTextNode(String(paramValue)));
  }

  return new Request(
    "https://realtime.nationalrail.co.uk/OpenLDBWS/ldb11.asmx",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/soap+xml; charset=utf-8",
      },

      body: String(dom),
    },
  );
}

async function SoapResponse(response: Response): Promise<Element> {
  const content = await response.text();

  const dom = new DOMParser().parseFromString(content, "text/xml");

  if (dom.getElementsByTagNameNS(SOAP_NS, "Fault").length > 0) {
    const code = dom.getElementsByTagNameNS(SOAP_NS, "Code")[0]?.textContent;
    const reason = dom.getElementsByTagNameNS(SOAP_NS, "Reason")[0]
      ?.textContent;

    throw new Error(`Soap fault (${code}): ${reason}`);
  }

  return dom.getElementsByTagNameNS(SOAP_NS, "Body")[0];
}

export default async function fetchOpenLDBWS(
  operation: string,
  params: Record<string, unknown>,
): Promise<WrappedXML> {
  const request = SoapRequest(operation + "Request", params);

  const response = await fetch(request).then(SoapResponse);

  return new WrappedXML(response);
}
