export default class WrappedXML {
  #element: Element;

  /** Wraps a generic XML element with querying methods. */
  constructor(element: Element) {
    this.#element = element;
  }

  /** Returns the stringified XML of the underlying element for debugging. */
  _xml(): string {
    return String(this.#element);
  }

  /** Iterates over the named descendents (ignoring namespaces). */
  *$$(tagName: string): Generator<WrappedXML, void, undefined> {
    for (const descendent of allDescendentsByTagName(this.#element, tagName)) {
      yield new WrappedXML(descendent);
    }
  }

  /** Iterates over the text content of each of the named descendents (ignoring namespaces). */
  *$$text(tagName: string): Generator<string, void, undefined> {
    for (const descendent of allDescendentsByTagName(this.#element, tagName)) {
      yield descendent.textContent ?? "";
    }
  }

  /** Returns the first named descendent (ignoring namespaces). */
  $(tagName: string): WrappedXML | undefined {
    const descendent = firstDescendentByTagName(this.#element, tagName);
    if (descendent) {
      return new WrappedXML(descendent);
    }
    return;
  }

  /** Returns the text content of the first named descendent (ignoring namespaces). */
  $text(tagName: string): string | undefined {
    const descendent = firstDescendentByTagName(this.#element, tagName);
    if (descendent) {
      return descendent.textContent ?? "";
    }
    return;
  }
}

function* allDescendentsByTagName(
  element: Element,
  tagName: string,
): Generator<Element, void, undefined> {
  const collection = element.getElementsByTagNameNS("*", tagName);

  for (let i = 0; i < collection.length; i++) {
    yield collection[i];
  }
}

function firstDescendentByTagName(
  element: Element,
  tagName: string,
): Element | undefined {
  const collection = element.getElementsByTagNameNS("*", tagName);

  return collection[0];
}
