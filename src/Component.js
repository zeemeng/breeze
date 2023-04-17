class Component extends HTMLElement {
  /**
   * HTML tag name to be associated with this custom element. This field is requied.
   *
   * Used by the static method `initClass` which internally invokes `CustomElementRegistry.define` to register
   * the current class definition. Note: the name must conform to
   * {@link https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name HTML Spec}
   * requirements.
   * @type {string}
   */
  static tagName;

  /**
   * A string containing the HTML markup of this custom element's shadow DOM content.
   *
   * It should only contain a static version of the shadow DOM markup given to all new instances
   * of this custom element.
   *
   * All dynamic mutations of the shadow DOM shall be performed elsewhere, such as in the `render` method.
   * @type {string}
   */
  static template = "";

  /**
   * A string containing CSS rulesets affecting the shadow DOM tree of the custom element.
   *
   * Set as the content of a new `HTMLStyleElement` prepended to the custom element's
   * template when static method `initClass` is invoked.
   * @type {string}
   */
  static styleSheet;

  /**
   * A string or an array of string each representing the path to a CSS file relative to the HTML document and containing
   * rulesets that apply to the shadow DOM tree of the custom element.
   *
   * For each string, an `HTMLLinkElement` is prepended to the custom element's template when static method
   * `initClass` is invoked.
   * @type {string | string[]}
   */
  static styleSheetPaths;

  /**
   * A string containing CSS rulesets affecting the "light" DOM tree. Useful for applying styles to
   * slotted, or the children of slotted elements.
   *
   * It is inserted in a new `HTMLStyleElement` appended to the document head
   * when static method `initClass` is invoked.
   * @type {string}
   */
  static lightDOMStyleSheet;

  /**
   * A string or an array of strings each representing the path to a CSS file relative to the HTML document and containing
   * rulesets that apply to the "light" DOM tree. Useful for applying styles to slotted, or the children
   * of slotted elements.
   *
   * For each string, an `HTMLLinkElement` is appended to the document head when static method
   * `initClass` is invoked.
   * @type {string | string[]}
   */
  static lightDOMStyleSheetPaths;

  /**
   * Options object used for configuring the attached shadow DOM tree.
   *
   * It is passed as argument to `Element.attachShadow()` when the custom element is instantiated.
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#parameters MDN Docs}.
   *
   * It has a default value of `{ mode: "open" }`.
   */
  static attachShadowOptions = { mode: "open" };

  /**
   * Performs initialization work for classes extending the {@link Component} base class.
   * Must be invoked before the child class is instantiated and after required static fields are
   * initialized.
   *
   * For example, could be called within a
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks static initialization block}
   * or as an initializer expression for a static field, such as `static init = this.initClass()`.
   */
  static initClass() {
    // Insert template content as defined by "static template" into templateElement
    this.templateElement = document.createElement("template");
    this.templateElement.innerHTML = this.template;

    // Append shadow DOM style sheets to `templateElement`
    if (typeof this.styleSheetPaths === "string" && this.styleSheetPaths.length) {
      const linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "stylesheet");
      linkElement.setAttribute("href", this.styleSheetPaths);
      this.templateElement.content.prepend(linkElement);
    }

    if (Array.isArray(this.styleSheetPaths))
      this.styleSheetPaths.reduceRight((accum, styleSheet) => {
        if (!styleSheet.length) return;
        const linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "stylesheet");
        linkElement.setAttribute("href", styleSheet);
        this.templateElement.content.prepend(linkElement);
      }, null);

    if (typeof this.styleSheet === "string" && this.styleSheet.length) {
      const styleElement = document.createElement("style");
      styleElement.textContent = this.styleSheet;
      this.templateElement.content.prepend(styleElement);
    }

    // Append light DOM style sheets to document head
    if (typeof this.lightDOMStyleSheetPaths === "string" && this.lightDOMStyleSheetPaths.length) {
      const linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "stylesheet");
      linkElement.setAttribute("href", this.lightDOMStyleSheetPaths);
      document.head.append(linkElement);
    }

    if (Array.isArray(this.lightDOMStyleSheetPaths))
      this.lightDOMStyleSheetPaths.reduce((accum, styleSheet) => {
        if (!styleSheet.length) return;
        const linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "stylesheet");
        linkElement.setAttribute("href", styleSheet);
        document.head.append(linkElement);
      }, null);

    if (typeof this.lightDOMStyleSheet === "string" && this.lightDOMStyleSheet.length) {
      const styleElement = document.createElement("style");
      styleElement.textContent = this.lightDOMStyleSheet;
      document.head.append(styleElement);
    }

    // Define this custom element in the `CustomElementRegistry`
    customElements.define(this.tagName, this);
  }

  /**
   * Component local state.
   *
   * Should be mutated using method {@link setState}. Avoid setting its value directly.
   * @type {any}
   */
  state = {};

  /**
   * A reference to the previous state value. May be used to optimize rendering methods when
   * dealing with structure state values that might partially change.
   * @type {any}
   */
  previousState = {};

  /**
   * Instantiates the custom element, attaches a shadow root and appends within it the nodes
   * defined by the template.
   */
  constructor() {
    super();
    this.attachShadow(this.constructor.attachShadowOptions);
    this.shadowRoot.append(this.constructor.templateElement.content.cloneNode(true));
  }

  /**
   * Mutates the local state.
   *
   * Also sets `this.previousState` to the old state value and call the `render` method.
   * @param {any} newValue
   */
  setState(newValue) {
    if (newValue !== this.state) {
      this.previousState = this.state;
      this.state = newValue;
      this.render();
    }
  }

  /**
   * Creates addition local states.
   *
   * Returns an object with a field `value` containing the current value, a field `previousValue`
   * containing the previous value, and a method `mutate` that shall be used to mutate the current
   * value.
   * @param {any} initialValue Initial value
   * @param {function} partialRender Optional. If provided, every time the state mutates, this
   * function will be called with no argument. Otherwise, the `render` method will be called on every mutation.
   */
  createState(initialValue, partialRender) {
    const render =
      typeof partialRender === "function" ? partialRender.bind(this) : this.render.bind(this);
    return {
      value: initialValue,
      previousValue: null,
      mutate(newValue) {
        if (newValue === this.value) return;
        this.previousValue = this.value;
        this.value = newValue;
        render();
      }
    };
  }

  /**
   * Optional. The default implementation calls the `render` method if the new value does not equal the old value.
   * @param {string} name
   * @param {string|undefined} oldValue
   * @param {string} newValue
   * @returns
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }

  /**
   * Optional. The default implementation calls the `render` method.
   */
  connectedCallback() {
    this.render();
  }

  /**
   * Function responsible for updating the custom element, the user interface, and for performing other side effects.
   *
   * It is invoked by multiple triggers, such as when the custom element is connected to the DOM tree, when the custom element
   * is upgraded, when states are mutated, and when observed attributes are changed.
   */
  render() {}
}

export default Component;
