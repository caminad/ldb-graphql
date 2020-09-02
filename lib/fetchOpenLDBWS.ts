import fetch, { Request } from "node-fetch";
import { DOMParser } from "xmldom";

const SOAP_NS = "http://www.w3.org/2003/05/soap-envelope";
const LDB_NS = "http://thalesgroup.com/RTTI/2017-10-01/ldb/";

function SoapRequest(
  endpoint: string,
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

  return new Request(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/soap+xml; charset=utf-8",
    },
    body: String(dom),
  });
}

function parseBody(content: string): Element {
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
): Promise<Element | undefined> {
  const url = "https://realtime.nationalrail.co.uk/OpenLDBWS/ldb11.asmx";

  const request = SoapRequest(url, operation + "Request", params);

  const response = await fetch(request);

  const content = await response.text();

  const body = parseBody(content);

  return body.getElementsByTagName(operation + "Response")[0];
}
