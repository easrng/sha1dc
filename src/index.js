/** @type {Uint8Array} */
let HEAPU8;
/** @type {WebAssembly.Instance & {exports: {memory: WebAssembly.Memory, buffer: WebAssembly.Global, buffer_size: WebAssembly.Global, ctx: WebAssembly.Global, SHA1DCInit: (ctx: number) => void, SHA1DCSetSafeHash: (ctx: Number, val: number) => void, SHA1DCSetUseUBC: (ctx: Number, val: number) => void, SHA1DCSetUseDetectColl: (ctx: Number, val: number) => void, SHA1DCSetDetectReducedRoundCollision: (ctx: Number, val: number) => void, SHA1DCUpdate: (ctx: number, buffer: Number, size: number) => void, SHA1DCFinal: (out: number, ctx: number) => number}}} */
let instance;
const e = /** @type {"e"} */ (String.fromCharCode(101));
/** @type {Promise<Response>} */
let res;
const url = new URL("../build/sha1dc.wasm", import.meta.url);
if (
  `proc${e}ss` in globalThis && globalThis[`proc${e}ss`]?.versions?.node &&
  import.meta.url.startsWith("file:")
) {
  // node doesn't support fetching file:// URLs
  const [fs, stream] =
    /** @type {[typeof import('node:fs'), typeof import('node:stream')]} */ (await Promise
      .all([import(`nod${e}:fs`), import(`nod${e}:stream`)]));
  res = Promise.resolve(
    new Response(
      /** @type {ReadableStream}*/ (stream.Readable.toWeb(
        fs.createReadStream(url),
      )),
      {
        headers: {
          "content-type": "application/wasm",
        },
      },
    ),
  );
} else {
  res = fetch(url);
}
const imports = {
  env: {
    abort() {
      throw new WebAssembly.RuntimeError("abort");
    },
    /**
     * @param {number} dest
     * @param {number} src
     * @param {number} num
     */
    _emscripten_memcpy_js(dest, src, num) {
      return HEAPU8.copyWithin(dest, src, src + num);
    },
  },
};
if ("instantiateStreaming" in WebAssembly) {
  instance = /** @type {any} */ ((await WebAssembly
    .instantiateStreaming(
      res,
      imports,
    )).instance);
} else {
  instance = /** @type {any} */ (await WebAssembly.instantiate(
    new WebAssembly.Module(await (await res).arrayBuffer()),
    imports,
  ));
}
const dataView = new DataView(instance.exports.memory.buffer);
HEAPU8 = new Uint8Array(instance.exports.memory.buffer);
const bufferSize = dataView.getInt32(instance.exports.buffer_size.value, true);
const bufferPtr = instance.exports.buffer.value;
const buffer = HEAPU8.subarray(bufferPtr, bufferPtr + bufferSize);
const ctxPtr = instance.exports.ctx.value;
const defaultOptions = {
  safeHash: true,
  useUBC: true,
  detectColl: true,
  detectReducedRoundCollision: false,
};
/**
 * @param {Uint8Array | Iterable<Uint8Array>} inputs
 * @param {{ safeHash: boolean; useUBC: boolean; detectColl: boolean; detectReducedRoundCollision: boolean; }} [options=defaultOptions]
 */
export function sha1dc(
  inputs,
  options = defaultOptions,
) {
  options = Object.assign({}, defaultOptions, options);
  instance.exports.SHA1DCInit(ctxPtr);
  const { safeHash, useUBC, detectColl, detectReducedRoundCollision } = options;
  if (!safeHash) {
    instance.exports.SHA1DCSetSafeHash(ctxPtr, 0);
  }
  if (!useUBC) {
    instance.exports.SHA1DCSetUseUBC(ctxPtr, 0);
  }
  if (!detectColl) {
    instance.exports.SHA1DCSetUseDetectColl(ctxPtr, 0);
  }
  if (detectReducedRoundCollision) {
    instance.exports.SHA1DCSetDetectReducedRoundCollision(ctxPtr, 1);
  }
  let offset = 0;
  if (inputs instanceof Uint8Array) {
    inputs = [inputs];
  }
  for (const input of inputs) {
    while (offset < input.length) {
      const remaining = input.length - offset;
      const chunk = remaining > bufferSize ? bufferSize : remaining;
      if (chunk === 0) {
        break;
      }
      buffer.set(input.subarray(offset, offset + chunk));
      instance.exports.SHA1DCUpdate(ctxPtr, bufferPtr, chunk);
      offset += chunk;
    }
  }
  const attackDetected = instance.exports.SHA1DCFinal(bufferPtr, ctxPtr);
  return attackDetected === 0 ? buffer.slice(0, 20) : null;
}
