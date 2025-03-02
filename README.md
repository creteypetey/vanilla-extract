# 🧁 vanilla-extract

**Zero-runtime Stylesheets-in-TypeScript.**

Write your styles in TypeScript (or JavaScript) with locally scoped class names and CSS Variables, then generate static CSS files at build time.

Basically, it’s [“CSS Modules](https://github.com/css-modules/css-modules)-in-TypeScript” but with scoped CSS Variables + heaps more.

🔥 &nbsp; All styles generated at build time — just like [Sass](https://sass-lang.com), [Less](http://lesscss.org), etc.

✨ &nbsp; Minimal abstraction over standard CSS.

🦄 &nbsp; Works with any front-end framework — or even without one.

🌳 &nbsp; Locally scoped class names — just like [CSS Modules.](https://github.com/css-modules/css-modules)

🚀 &nbsp; Locally scoped [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties), `@keyframes` and `@font-face` rules.

🎨 &nbsp; High-level theme system with support for simultaneous themes. No globals!

🛠 &nbsp; Utils for generating variable-based `calc` expressions.

💪 &nbsp; Type-safe styles via [CSSType.](https://github.com/frenic/csstype)

🏃‍♂️ &nbsp; Optional runtime version for development and testing.

🙈 &nbsp; Optional API for dynamic runtime theming.

---

🖥 &nbsp; [Try it out for yourself in CodeSandbox.](https://codesandbox.io/s/github/seek-oss/vanilla-extract/tree/master/examples/webpack-react?file=/src/App.css.ts)

---

**Write your styles in `.css.ts` files.**

```ts
// styles.css.ts

import { createTheme, style } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  color: {
    brand: 'blue'
  },
  font: {
    body: 'arial'
  }
});

export const exampleStyle = style({
  backgroundColor: vars.color.brand,
  fontFamily: vars.font.body,
  color: 'white',
  padding: 10
});
```

> 💡 Once you've [configured your build tooling,](#setup) these `.css.ts` files will be evaluated at build time. None of the code in these files will be included in your final bundle. Think of it as using TypeScript as your preprocessor instead of Sass, Less, etc.

**Then consume them in your markup.**

```ts
// app.ts

import { themeClass, exampleStyle } from './styles.css.ts';

document.write(`
  <section class="${themeClass}">
    <h1 class="${exampleStyle}">Hello world!</h1>
  </section>
`);
```

---

Want to work at a higher level while maximising style re-use? Check out  🍨 [Sprinkles](https://vanilla-extract.style/documentation/sprinkles-api), our official zero-runtime atomic CSS framework, built on top of vanilla-extract.

---

- [Setup](#setup)
  - [webpack](#webpack)
  - [esbuild](#esbuild)
  - [Vite](#vite)
  - [Next.js](#nextjs)
  - [Gatsby](#gatsby)
  - [Test environments](#test-environments)
  - [Configuration](#configuration)
    - [identifiers](#identifiers)
- [Styling API](#styling-api)
  - [style](#style)
  - [styleVariants](#stylevariants)
  - [globalStyle](#globalstyle)
  - [createTheme](#createtheme)
  - [createGlobalTheme](#createglobaltheme)
  - [createThemeContract](#createthemecontract)
  - [createGlobalThemeContract](#createglobalthemecontract)
  - [assignVars](#assignvars)
  - [createVar](#createvar)
  - [fallbackVar](#fallbackvar)
  - [fontFace](#fontface)
  - [globalFontFace](#globalfontface)
  - [keyframes](#keyframes)
  - [globalKeyframes](#globalkeyframes)
- [Recipes API](#recipes-api)
  - [recipe](#recipe)
- [Dynamic API](#dynamic-api)
  - [assignInlineVars](#assigninlinevars)
  - [setElementVars](#setelementvars)
- [Utility functions](#utility-functions)
  - [calc](#calc)
- [Thanks](#thanks)
- [License](#license)

---

## Setup

There are currently a few integrations to choose from.

### webpack

1. Install the dependencies.

```bash
npm install @vanilla-extract/css @vanilla-extract/webpack-plugin
```

2. Add the [webpack](https://webpack.js.org) plugin.

> 💡 This plugin accepts an optional [configuration object](#configuration).

```js
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');

module.exports = {
  plugins: [new VanillaExtractPlugin()],
};
```

<details>
  <summary>You'll need to ensure you're handling CSS files in your webpack config.</summary>

  <br/>
  For example:
  
  ```js
  const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');

  module.exports = {
    plugins: [
      new VanillaExtractPlugin(),
      new MiniCssExtractPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.vanilla\.css$/i, // Targets only CSS files generated by vanilla-extract
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                url: false // Required as image imports should be handled via JS/TS import statements
              }
            }
          ]
        }
      ]
    }
  };
  ```
</details>

3. If you'd like automatic debuggable identifiers, you can add the [Babel](https://babeljs.io) plugin.
   
```bash
$ npm install @vanilla-extract/babel-plugin
```

```json
{
  "plugins": ["@vanilla-extract/babel-plugin"]
}
```

### esbuild

1. Install the dependencies.

```bash
npm install @vanilla-extract/css @vanilla-extract/esbuild-plugin
```

2. Add the [esbuild](https://esbuild.github.io/) plugin to your build script.

> 💡 This plugin accepts an optional [configuration object](#configuration).

```js
const { vanillaExtractPlugin } = require('@vanilla-extract/esbuild-plugin');

require('esbuild').build({
  entryPoints: ['app.ts'],
  bundle: true,
  plugins: [vanillaExtractPlugin()],
  outfile: 'out.js',
}).catch(() => process.exit(1))
```

> Please note: There are currently no automatic readable class names during development. However, you can still manually provide a debug ID as the last argument to functions that generate scoped styles, e.g. `export const className = style({ ... }, 'className');`

3. Process CSS

As [esbuild](https://esbuild.github.io/) currently doesn't have a way to process the CSS generated by vanilla-extract, you can optionally use the `processCss` option.

For example, to run autoprefixer over the generated CSS.

```js
const {
  vanillaExtractPlugin
} = require('@vanilla-extract/esbuild-plugin');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

async function processCss(css) {
  const result = await postcss([autoprefixer]).process(
    css,
    {
      from: undefined /* suppress source map warning */
    }
  );

  return result.css;
}

require('esbuild')
  .build({
    entryPoints: ['app.ts'],
    bundle: true,
    plugins: [
      vanillaExtractPlugin({
        processCss
      })
    ],
    outfile: 'out.js'
  })
  .catch(() => process.exit(1));
```

### Vite

1. Install the dependencies.

```bash
npm install @vanilla-extract/css @vanilla-extract/vite-plugin
```

2. Add the [Vite](https://vitejs.dev/) plugin to your Vite config.

> 💡 This plugin accepts an optional [configuration object](#configuration).

```js
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

// vite.config.js
export default {
  plugins: [vanillaExtractPlugin()]
}
```

> Please note: There are currently no automatic readable class names during development. However, you can still manually provide a debug ID as the last argument to functions that generate scoped styles, e.g. `export const className = style({ ... }, 'className');`

### Next.js

1. Install the dependencies.

```bash
npm install @vanilla-extract/css @vanilla-extract/babel-plugin @vanilla-extract/next-plugin
```

2. If you don't have a `next.config.js` file in the root of your project, create one. Add the [Next.js](https://nextjs.org) plugin to your `next.config.js` file.

> 💡 This plugin accepts an optional [configuration object](#configuration).

```js
const {
  createVanillaExtractPlugin
} = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withVanillaExtract(nextConfig);
```

If required, this plugin can be composed with other plugins.

```js
const {
  createVanillaExtractPlugin
} = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

const withMDX = require('@next/mdx')({
  extension: /\.mdx$/
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withVanillaExtract(withMDX(nextConfig));
```

3. (Optional) If you want to automatically generate debug IDs during development, you can add the [Babel](https://babeljs.io) plugin. Note that this step will cause Next.js to switch from [SWC](https://github.com/swc-project/swc) to Babel, increasing build times. This may or may not be an issue depending on the size of your project.

> Note: While optional for Next.js, the Babel plugin is still required when trying to run `.css.ts` files in Node for unit testing since the files are no longer being processed by a bundler.

If you don't have a `.babelrc` file in the root of your project, create one. Add the Babel plugin to your `.babelrc` file, ensuring that you're also including `"next/babel"` in your `presets` array.

```json
{
  "presets": ["next/babel"],
  "plugins": ["@vanilla-extract/babel-plugin"]
}
```

### Gatsby

To add to your [Gatsby](https://www.gatsbyjs.com) site, use the [gatsby-plugin-vanilla-extract](https://github.com/KyleAMathews/gatsby-plugin-vanilla-extract) plugin.

### Test environments

1. Install the dependencies.

```bash
$ npm install @vanilla-extract/babel-plugin
```

2. Add the [Babel](https://babeljs.io) plugin.

```json
{
  "plugins": ["@vanilla-extract/babel-plugin"]
}
```

3. Disable runtime styles (Optional)

In testing environments (like `jsdom`) vanilla-extract will create and insert styles. While this is often desirable, it can be a major slowdown in your tests. If your tests don’t require styles to be available, the `disableRuntimeStyles` import will disable all style creation.

```ts
// setupTests.ts
import '@vanilla-extract/css/disableRuntimeStyles';
```

### Configuration

#### identifiers

Different formatting of identifiers (e.g. class names, keyframes, CSS Vars, etc) can be configured by selecting from the following options:

- `short` identifiers are a 7+ character hash. e.g. `hnw5tz3`
- `debug` identifiers contain human readable prefixes representing the owning filename and a potential rule level debug name. e.g. `myfile_mystyle_hnw5tz3`

Each integration will set a default value based on the configuration options passed to the bundler.

---

## Styling API

> 🍬 If you're a [treat](https://seek-oss.github.io/treat) user, check out our [migration guide.](./docs/treat-migration-guide.md)

### style

Creates styles attached to a locally scoped class name.

```ts
import { style } from '@vanilla-extract/css';

export const className = style({
  display: 'flex'
});
```

CSS Variables, simple pseudos, selectors and media/feature queries are all supported.

```ts
import { style } from '@vanilla-extract/css';
import { vars } from './vars.css.ts';

export const className = style({
  display: 'flex',
  vars: {
    [vars.localVar]: 'green',
    '--global-variable': 'purple'
  },
  ':hover': {
    color: 'red'
  },
  selectors: {
    '&:nth-child(2n)': {
      background: '#fafafa'
    }
  },
  '@media': {
    'screen and (min-width: 768px)': {
      padding: 10
    }
  },
  '@supports': {
    '(display: grid)': {
      display: 'grid'
    }
  }
});
```

Selectors can also contain references to other scoped class names.

```ts
import { style } from '@vanilla-extract/css';

export const parentClass = style({});

export const childClass = style({
  selectors: {
    [`${parentClass}:focus &`]: {
      background: '#fafafa'
    }
  },
});
```

> 💡 To improve maintainability, each style block can only target a single element. To enforce this, all selectors must target the “&” character which is a reference to the current element.
>
> For example, `'&:hover:not(:active)'` and `` [`${parentClass} &`] `` are considered valid, while `'& a[href]'` and `` [`& ${childClass}`] `` are not.
>
> If you want to target another scoped class then it should be defined within the style block of that class instead.
>
> For example, `` [`& ${childClass}`] `` is invalid since it doesn’t target “&”, so it should instead be defined in the style block for `childClass`.
>
> If you want to globally target child nodes within the current element (e.g. `'& a[href]'`), you should use [`globalStyle`](#globalstyle) instead.

Multiple styles can be composed into a single rule by providing an array of styles.

```ts
import { style } from '@vanilla-extract/css';

const base = style({ padding: 12 });

export const primary = style([
  base,
  { background: 'blue' }
]);

export const secondary = style([
  base,
  { background: 'aqua' }
]);
```

When composed styles are used in selectors, they are assigned an additional class if required so they can be uniquely identified. When selectors are processed internally, the composed classes are removed, only leaving behind the unique identifier classes. This allows you to treat them as if they were a single class within vanilla-extract selectors.

```ts
import {
  style,
  globalStyle,
} from '@vanilla-extract/css';

const background = style({ background: 'mintcream' });
const padding = style({ padding: 12 });

export const container = style([background, padding]);

globalStyle(`${container} *`, {
  boxSizing: 'border-box'
});
```

### styleVariants

Creates a collection of named style variants.

```ts
import { styleVariants } from '@vanilla-extract/css';

export const variant = styleVariants({
  primary: { background: 'blue' },
  secondary: { background: 'aqua' },
});
```

> 💡 This is useful for mapping component props to styles, e.g. `<button className={styles.variant[props.variant]}>`

Multiple styles can be composed into a single rule by providing an array of styles.

```ts
import { styleVariants } from '@vanilla-extract/css';

const base = style({ padding: 12 });

export const variant = styleVariants({
  primary: [base, { background: 'blue' }],
  secondary: [base, { background: 'aqua' }],
});
```

You can also transform the values by providing a map function as the second argument.

```ts
import { styleVariants } from '@vanilla-extract/css';

const base = style({ padding: 12 });

const backgrounds = {
  primary: 'blue',
  secondary: 'aqua'
} as const;

export const variant = styleVariants(
  backgrounds,
  (background) => [base, { background }]
);
```

### globalStyle

Creates styles attached to a global selector.

```ts
import { globalStyle } from '@vanilla-extract/css';

globalStyle('html, body', {
  margin: 0
});
```

Global selectors can also contain references to other scoped class names.

```ts
import { style, globalStyle } from '@vanilla-extract/css';

export const parentClass = style({});

globalStyle(`${parentClass} > a`, {
  color: 'pink'
});
```

### createTheme

Creates a locally scoped theme class and a theme contract which can be consumed within your styles.

**Ensure this function is called within a `.css.ts` context, otherwise variable names will be mismatched between files.**

```ts
// theme.css.ts

import { createTheme } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  color: {
    brand: 'blue'
  },
  font: {
    body: 'arial'
  }
});
```

You can create theme variants by passing a theme contract as the first argument to `createTheme`.

```ts
// themes.css.ts

import { createTheme } from '@vanilla-extract/css';

export const [themeA, vars] = createTheme({
  color: {
    brand: 'blue'
  },
  font: {
    body: 'arial'
  }
});

export const themeB = createTheme(vars, {
  color: {
    brand: 'pink'
  },
  font: {
    body: 'comic sans ms'
  }
});
```

> 💡 All theme variants must provide a value for every variable or it’s a type error.

### createGlobalTheme

Creates a theme attached to a global selector, but with locally scoped variable names.

**Ensure this function is called within a `.css.ts` context, otherwise variable names will be mismatched between files.**

```ts
// theme.css.ts

import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: {
    brand: 'blue'
  },
  font: {
    body: 'arial'
  }
});
```

> 💡 All theme variants must provide a value for every variable or it’s a type error.

If you want to implement an existing theme contract, you can pass it as the second argument.

```ts
// theme.css.ts

import {
  createThemeContract,
  createGlobalTheme
} from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    brand: null
  },
  font: {
    body: null
  }
});

createGlobalTheme(':root', vars, {
  color: {
    brand: 'blue'
  },
  font: {
    body: 'arial'
  }
});
```

### createThemeContract

Creates a contract of locally scoped variable names for themes to implement.

**Ensure this function is called within a `.css.ts` context, otherwise variable names will be mismatched between files.**

> 💡 This is useful if you want to split your themes into different bundles. In this case, your themes would be defined in separate files, but we'll keep this example simple.

```ts
// themes.css.ts

import {
  createThemeContract,
  createTheme
} from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    brand: null
  },
  font: {
    body: null
  }
});

export const themeA = createTheme(vars, {
  color: {
    brand: 'blue'
  },
  font: {
    body: 'arial'
  }
});

export const themeB = createTheme(vars, {
  color: {
    brand: 'pink'
  },
  font: {
    body: 'comic sans ms'
  }
});
```

### createGlobalThemeContract

Creates a contract of globally scoped variable names for themes to implement.

> 💡 This is useful if you want to make your theme contract available to non-JavaScript environments.

```ts
// themes.css.ts

import {
  createGlobalThemeContract,
  createGlobalTheme
} from '@vanilla-extract/css';

export const vars = createGlobalThemeContract({
  color: {
    brand: 'color-brand'
  },
  font: {
    body: 'font-body'
  }
});

createGlobalTheme(':root', vars, {
  color: {
    brand: 'blue'
  },
  font: {
    body: 'arial'
  }
});
```

You can also provide a map function as the second argument which has access to the value and the object path.

For example, you can automatically prefix all variable names.

```ts
// themes.css.ts

import { createGlobalThemeContract } from '@vanilla-extract/css';

export const vars = createGlobalThemeContract({
  color: {
    brand: 'color-brand'
  },
  font: {
    body: 'font-body'
  }
}, (value) => `prefix-${value}`);
```

You can also use the map function to automatically generate names from the object path, joining keys with a hyphen.

```ts
// themes.css.ts

import { createGlobalThemeContract } from '@vanilla-extract/css';

export const vars = createGlobalThemeContract({
  color: {
    brand: null
  },
  font: {
    body: null
  }
}, (_value, path) => `prefix-${path.join('-')}`);
```

### assignVars

Assigns a collection of CSS Variables anywhere within a style block.

> 💡 This is useful for creating responsive themes since it can be used within `@media` blocks.

```ts
import { createThemeContract, style, assignVars } from '@vanilla-extract/css';

export const vars = createThemeContract({
  space: {
    small: null,
    medium: null,
    large: null
  }
});

export const responsiveSpaceTheme = style({
  vars: assignVars(vars.space, {
    small: '4px',
    medium: '8px',
    large: '16px'
  }),
  '@media': {
    'screen and (min-width: 1024px)': {
      vars: assignVars(vars.space, {
        small: '8px',
        medium: '16px',
        large: '32px'
      })
    }
  }
});
```

> 💡 All variables passed into this function must be assigned or it’s a type error.

### createVar

Creates a single CSS Variable.

```ts
import { createVar, style } from '@vanilla-extract/css';

export const colorVar = createVar();

export const exampleStyle = style({
  color: colorVar
});
```

Scoped variables can be set via the `vars` property on style objects.

```ts
import { createVar, style } from '@vanilla-extract/css';
import { colorVar } from './vars.css.ts';

export const parentStyle = style({
  vars: {
    [colorVar]: 'blue'
  }
});
```

### fallbackVar

Provides fallback values when consuming variables.

```ts
import { createVar, fallbackVar, style } from '@vanilla-extract/css';

export const colorVar = createVar();

export const exampleStyle = style({
  color: fallbackVar(colorVar, 'blue');
});
```

Multiple fallbacks are also supported.

```ts
import { createVar, fallbackVar, style } from '@vanilla-extract/css';

export const primaryColorVar = createVar();
export const secondaryColorVar = createVar();

export const exampleStyle = style({
  color: fallbackVar(primaryColorVar, secondaryColorVar, 'blue');
});
```

### fontFace

Creates a custom font attached to a locally scoped font name.

```ts
import { fontFace, style } from '@vanilla-extract/css';

const myFont = fontFace({
  src: 'local("Comic Sans MS")'
});

export const text = style({
  fontFamily: myFont
});
```

### globalFontFace

Creates a globally scoped custom font.

```ts
import {
  globalFontFace,
  style
} from '@vanilla-extract/css';

globalFontFace('MyGlobalFont', {
  src: 'local("Comic Sans MS")'
});

export const text = style({
  fontFamily: 'MyGlobalFont'
});
```

### keyframes

Creates a locally scoped set of keyframes.

```ts
import { keyframes, style } from '@vanilla-extract/css';

const rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
});

export const animated = style({
  animation: `3s infinite ${rotate}`,
});
```

### globalKeyframes

Creates a globally scoped set of keyframes.

```ts
import { globalKeyframes, style } from '@vanilla-extract/css';

globalKeyframes('rotate', {
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
});

export const animated = style({
  animation: `3s infinite rotate`,
});
```

## Recipes API

Create multi-variant styles with a type-safe runtime API, heavily inspired by [Stitches.](https://stitches.dev)

As with the rest of vanilla-extract, all styles are generated at build time.

```bash
$ npm install @vanilla-extract/recipes
```

### recipe

Creates a multi-variant style function that can be used at runtime or statically in `.css.ts` files.

Accepts an optional set of `base` styles, `variants`, `compoundVariants` and `defaultVariants`.

```ts
import { recipe } from '@vanilla-extract/recipes';

export const button = recipe({
  base: {
    borderRadius: 6
  },

  variants: {
    color: {
      neutral: { background: 'whitesmoke' },
      brand: { background: 'blueviolet' },
      accent: { background: 'slateblue' }
    },
    size: {
      small: { padding: 12 },
      medium: { padding: 16 },
      large: { padding: 24 }
    },
    rounded: {
      true: { borderRadius: 999 }
    }
  },

  // Applied when multiple variants are set at once
  compoundVariants: [
    {
      variants: {
        color: 'neutral',
        size: 'large'
      },
      style: {
        background: 'ghostwhite'
      }
    }
  ],

  defaultVariants: {
    color: 'accent',
    size: 'medium'
  }
});
```

With this recipe configured, you can now use it in your templates.

```ts
import { button } from './button.css.ts';

document.write(`
  <button class="${button({
    color: 'accent',
    size: 'large',
    rounded: true
  })}">
    Hello world
  </button>
`);
```

Your recipe configuration can also make use of existing variables, classes and styles.

For example, you can pass in the result of your [`sprinkles`](https://vanilla-extract.style/documentation/sprinkles-api) function directly.

```ts
import { recipe } from '@vanilla-extract/recipes';
import { reset } from './reset.css.ts';
import { sprinkles } from './sprinkles.css.ts';

export const button = recipe({
  base: [reset, sprinkles({ borderRadius: 'round' })],

  variants: {
    color: {
      neutral: sprinkles({ background: 'neutral' }),
      brand: sprinkles({ background: 'brand' }),
      accent: sprinkles({ background: 'accent' })
    },
    size: {
      small: sprinkles({ padding: 'small' }),
      medium: sprinkles({ padding: 'medium' }),
      large: sprinkles({ padding: 'large' })
    }
  },

  defaultVariants: {
    color: 'accent',
    size: 'medium'
  }
});
```

## Dynamic API

Dynamically update theme variables at runtime.

```bash
npm install @vanilla-extract/dynamic
```

### assignInlineVars

Assigns CSS Variables as inline styles.

```tsx
// app.tsx

import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from './vars.css.ts';

const MyComponent = () => (
  <section
    style={assignInlineVars({
      [vars.colors.brand]: 'pink',
      [vars.colors.accent]: 'green'
    })}
  >
    ...
  </section>
);
```

You can also assign collections of variables by passing a theme contract as the first argument. All variables must be assigned or it’s a type error.

```tsx
// app.tsx

import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from './vars.css.ts';

const MyComponent = () => (
  <section
    style={assignInlineVars(vars.colors, {
      brand: 'pink',
      accent: 'green'
    })}
  >
    ...
  </section>
);
```

Even though this function returns an object of inline styles, its `toString` method returns a valid `style` attribute value so that it can be used in string templates.

```tsx
// app.ts

import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from './vars.css.ts';

document.write(`
  <section style="${assignInlineVars({
    [vars.colors.brand]: 'pink',
    [vars.colors.accent]: 'green'
  })}">
    ...
  </section>
`);
```

### setElementVars

Sets CSS Variables on a DOM element.

```tsx
// app.ts

import { setElementVars } from '@vanilla-extract/dynamic';
import { vars } from './styles.css.ts';

const el = document.getElementById('myElement');

setElementVars(el, {
  [vars.colors.brand]: 'pink',
  [vars.colors.accent]: 'green'
});
```

You can also set collections of variables by passing a theme contract as the second argument. All variables must be set or it’s a type error.

```tsx
// app.ts

import { setElementVars } from '@vanilla-extract/dynamic';
import { vars } from './styles.css.ts';

const el = document.getElementById('myElement');

setElementVars(el, vars.colors, {
  brand: 'pink',
  accent: 'green'
});
```

## Utility functions

We also provide a standalone package of optional utility functions to make it easier to work with CSS in TypeScript.

> 💡 This package can be used with any CSS-in-JS library.

```bash
npm install @vanilla-extract/css-utils
```

### calc

Streamlines the creation of CSS calc expressions.

```ts
import { calc } from '@vanilla-extract/css-utils';

const styles = {
  height: calc.multiply('var(--grid-unit)', 2)
};
```

The following functions are available.

- `calc.add`
- `calc.subtract`
- `calc.multiply`
- `calc.divide`
- `calc.negate`

The `calc` export is also a function, providing a chainable API for complex calc expressions.

```ts
import { calc } from '@vanilla-extract/css-utils';

const styles = {
  marginTop: calc('var(--space-large)')
    .divide(2)
    .negate()
    .toString()
};
```

---

## Thanks

- [Nathan Nam Tran](https://twitter.com/naistran) for creating [css-in-js-loader](https://github.com/naistran/css-in-js-loader), which served as the initial starting point for [treat](https://seek-oss.github.io/treat), the precursor to this library.
- [Stitches](https://stitches.dev/) for getting us excited about CSS-Variables-in-JS.
- [SEEK](https://www.seek.com.au) for giving us the space to do interesting work.

## License

MIT.
