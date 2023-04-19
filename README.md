<h1 align="center">Breeze</h1>
<p align="center">
  <img src="https://img.shields.io/npm/v/breeze-wc?color=informational&logo=npm&logoColor=fff&logoWidth=12&label=npm%20package" alt="NPM package version" />
  <img src="https://img.shields.io/node/v/breeze-wc" alt="supported node version" />
  <img src="https://img.shields.io/bundlephobia/min/breeze-wc?color=success" alt="minified bundle size" />
  <img src="https://img.shields.io/github/license/zeemeng/breeze" alt="license" />
</p>

## About

_Breeze_ is a framework for working with Web Components. It aims to make the process of crafting Web Components easier, faster and more pleasant. It requires no build step, has no dependency, and is quick to get started with.

## Installation

Via NPM:

```shell
$ npm i breeze-wc
```

or `git clone` this [repository](https://github.com/zeemeng/breeze.git).

## Usage

The following guide assumes that the reader has a basic understanding of Web Components. If such is not the case, it is recommended to first check out the resources listed in the [learn more](#learn-more-about-web-components) section below.

### Import and setup:

First add a script tag of type "module" pointing to the location/url where your component definition will be found.

```html
<!-- FILE index.html -->
<head>
  ...
  <script type="module" src="./MyComponent.js">
</head>
```

Then import `Component` from _Breeze_ and export a custom class definition extending `Component`.

```js
/* FILE MyComponent.js */
import Component from "breeze-wc"; // In a Node environment (will require a module bundler/build step)

// OR

import Component from "./breeze/index.js"; // Import from index.js in non-Node environments (DOES NOT require a build step)

export class MyComponent extends Component {}
```

Note that importing from _Breeze_ using a NPM package specifier will require a bundler tool such as _Webpack_ or _Rollup_ to process your files since browsers cannot work with such specifier format. Though if you installed via NPM, you can still avoid the need to use a bundler tool by importing directly from `node_modules/breeze-wc/index.js`.

### Basic component example

```js
import Component from "./breeze/index.js";

export class MyComponent extends Component {
  static tagName = "my-component";

  static template = `
  <div>Hello world!</div>
  <p>Good morning!</p>
  `;

  static styleSheet = `
  div {
    color: blue;
  }

  p {
    font-weight: 700;
  }
  `;

  static init = this.initClass();
}
```

This will define a custom HTML element that uses the tag `<my-component></my-component>` in the main HTML document. The `template` static property defines the contents of the custom element's shadow DOM. The `StyleSheet` static property will create a `<style></style>` in the shadow DOM that has the the given string value as it's content. Finally it is **very important** to call `MyComponent.initClass()`, since it is this method that initializes the custom element according to the definition that we provide. In the above example, the method is invoked in the declaration `static init = this.initClass()`. The static property `init` itself is of no importance, we only use it for convenience reasons.

### Advanced component example

```js
import Component from "./breeze/index.js";

export class MyComponent extends Component {
  static tagName = "my-component";

  static template = `
  <div>Hello world!</div>
  <p>Good morning!</p>
  <div class="counter"></div>
  `;

  static styleSheetPaths = "./a-path/to-a-css-file.css"; // A path or an array of paths to a CSS file relative to the HTML document. These files shall contain rulesets that apply to the shadow DOM tree of the custom element.

  static init = this.initClass();

  counterState = this.createState(0); // Creates a local state value and assign it to a public class property.

  // Lifecycle method defined by the "WHATWG HTML Spec".
  connectedCallback() {
    setInterval(() => this.counterState.mutate(this.counterState.value + 1), 1000); // Increments the state value every 1000ms.
  }

  // Special method invoke on every local state mutation.
  render() {
    this.shadowRoot.querySelector(".counter").textContent = this.counterState.value;
  }
}
```

Note that as observed in the above example, `render` is special method responsible for updating the custom element, the user interface, and for performing other side effects. It is invoked by multiple triggers, such as when the custom element is connected to the DOM tree, when the custom element is upgraded, when states are mutated, and when observed attributes are changed.

## Learn more about Web Components

- https://html.spec.whatwg.org/multipage/custom-elements.html
- https://javascript.info/web-components
- https://developer.mozilla.org/en-US/docs/Web/API/Web_components

## Notes

- This package is fully annotated and supports **IntelliSense**.
- Suggestions and contributions are welcome.
