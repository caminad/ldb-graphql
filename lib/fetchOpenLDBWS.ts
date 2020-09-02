import DomHandler, { Node } from "domhandler";
import { getElementsByTagName, getText } from "domutils";
import { decodeXML } from "entities";
import { Parser } from "htmlparser2";
import fetch, { Request } from "node-fetch";
import { create } from "xmlbuilder2";
import { XMLBuilder } from "xmlbuilder2/lib/interfaces";

function getContained(outerTagName: string, nodes: Node[]) {
  const [container] = getElementsByTagName(outerTagName, nodes, false, 1);
  return container?.children ?? [];
}

interface SoapEnvelopeOptions {
  headers: Record<string, unknown>;
  body: Record<string, unknown>;
}

function SoapEnvelope(options: SoapEnvelopeOptions): XMLBuilder {
  return create({
    "soap:Envelope": {
      "@xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
      "soap:Header": options.headers,
      "soap:Body": options.body,
    },
  });
}

function SoapRequest(endpoint: string, options: SoapEnvelopeOptions): Request {
  return new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/soap+xml; charset=utf-8" },
    body: SoapEnvelope(options).toString(),
  });
}

function parseBody(content: string): Node[] {
  const handler = new DomHandler();
  const parser = new Parser(handler, { xmlMode: true });

  parser.parseComplete(content);

  const envelopeContents = getContained("soap:Envelope", handler.dom);
  const bodyContents = getContained("soap:Body", envelopeContents);
  const faultContents = getContained("soap:Fault", bodyContents);

  if (faultContents.length > 0) {
    const code = getText(getContained("soap:Code", faultContents));
    const reason = decodeXML(
      getText(getContained("soap:Reason", faultContents)) || "",
    );

    throw new Error(`Soap fault (${code}): ${reason}`);
  }

  return bodyContents;
}

export default async function fetchOpenLDBWS(
  operation: string,
  params: Record<string, unknown>,
): Promise<Node[] | undefined> {
  const url = "https://realtime.nationalrail.co.uk/OpenLDBWS/ldb11.asmx";

  const request = SoapRequest(url, {
    headers: {
      AccessToken: { TokenValue: process.env.LDB_TOKEN },
    },

    body: {
      "@xmlns": "http://thalesgroup.com/RTTI/2017-10-01/ldb/",
      [operation + "Request"]: params,
    },
  });

  const response = await fetch(request);

  const content = await response.text();

  const body = parseBody(content);

  return getContained(operation + "Response", body);
}
