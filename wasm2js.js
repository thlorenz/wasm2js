'use strict'

/**
 * Takes a `.wasm` binary and wraps it inside a commonJS module that can be required
 * in Node.js and the browser.
 *
 * @name wasm2js
 *
 * @param {Buffer} wasmBuf a buffer of the .wasm code
 * @returns {String} the commonJS module code that wraps the wasm
 */
module.exports = function wasm2js(wasmBuf) {
  const wasm = wasmBuf.toString('base64')

  return `
    module.exports = loadWebAssembly

    loadWebAssembly.supported = typeof WebAssembly !== 'undefined'

    function loadWebAssembly (opts) {
      if (!loadWebAssembly.supported) return null

      var imp = opts && opts.imports
      var wasm = toUint8Array('${wasm}')
      var ready = null

      var mod = {
        buffer: wasm,
        memory: null,
        exports: null,
        realloc: realloc,
        onload: onload
      }

      onload(function () {})

      return mod

      function realloc (size) {
        mod.exports.memory.grow(Math.max(0, Math.ceil(Math.abs(size - mod.memory.length) / 65536)))
        mod.memory = new Uint8Array(mod.exports.memory.buffer)
      }

      function onload (cb) {
        if (mod.exports) return cb()

        if (ready) {
          ready.then(cb.bind(null, null)).catch(cb)
          return
        }

        try {
          if (opts && opts.async) throw new Error('async')
          setup({instance: new WebAssembly.Instance(new WebAssembly.Module(wasm), imp)})
        } catch (err) {
          ready = WebAssembly.instantiate(wasm, imp).then(setup)
        }

        onload(cb)
      }

      function setup (w) {
        mod.exports = w.instance.exports
        mod.memory = mod.exports.memory && mod.exports.memory.buffer && new Uint8Array(mod.exports.memory.buffer)
      }
    }

    function toUint8Array (s) {
      if (typeof atob === 'function') return new Uint8Array(atob(s).split('').map(charCodeAt))
      return (require('buf' + 'fer').Buffer).from(s, 'base64')
    }

    function charCodeAt (c) {
      return c.charCodeAt(0)
    }
    `.replace(/^ {4}/gm, '')
}
