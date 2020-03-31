interface UINode<K extends keyof HTMLElementTagNameMap> {
  type: K;
  attrs: Record<string, any>;
  children: any;
}

export function renderToDOM<T extends Node>(child: T, element: HTMLElement) {
  element.appendChild(child);
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  type: K,
  opts?: { attrs?: Record<string, any>; children?: any }
) {
  if (type == null || typeof type !== "string") {
    throw Error("The element type must be a string");
  }

  if (
    arguments[1] !== undefined &&
    Object.prototype.toString.call(opts) !== "[object Object]"
  ) {
    throw Error("The options argument must be an object");
  }

  const { attrs = {}, children = [] } = opts || {};

  return {
    type,
    attrs,
    children
  };
}

const EventDictionary = {
  handleEvent(evt: UIEvent) {
    const eventHandler = this[`on${evt.type}`];
    const result = eventHandler.call(evt.currentTarget, evt);

    if (result === false) {
      evt.preventDefault();
      evt.stopPropagation();
    }
  }
};

function renderElement<K extends keyof HTMLElementTagNameMap>(opts: UINode<K>) {
  const { type, attrs, children } = opts;

  const element = document.createElement(type);

  for (const [attribute, value] of Object.entries(attrs)) {
    if (attribute[0] === "o" && attribute[1] === "n") {
      const events = Object.create(EventDictionary);
      element.addEventListener(attribute.slice(2), events);
      events[attribute] = value;
    }

    element.setAttribute(attribute, value);
  }

  for (const child of children) {
    element.appendChild(render(child));
  }

  return element;
}

export function render<T extends keyof HTMLElementTagNameMap>(
  vNode: UINode<T> | string
) {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }

  return renderElement(vNode);
}
