# wasm2js

Compile WebAssembly .wasm files to a commonjs module.

```js
const wasmBuffer = fs.readFileSync(inp)
const js = wasm2js(wasmBuffer)
```

## CLI

```sh
wasm2js example.wasm -o example.js
```

## Installation

    npm install wasm2js

## [API](https://thlorenz.github.io/wasm2js)

## Kudos

90% of this code was extracted from @mafintosh's [wat2js](https://github.com/mafintosh/wat2js).

## License

MIT
