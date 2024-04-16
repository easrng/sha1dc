# sha1dc

A WebAssembly port of the hardened SHA1 hash function used by Git

## Usage

```js
import sha1dc from "sha1dc";
const hex = (array) =>
  array.reduce((acc, num) => acc + num.toString(16).padStart(2, "0"), "");

// hashes like sha1 ...
const data = new TextEncoder().encode("hello!");
console.log(hex(sha1dc(data))); // 8f7d88e901a5ad3a05d8cc0de93313fd76028f8c

// ... but detects collisions!
const shattered = new Uint8Array(
  await (
    await fetch("https://shattered.io/static/shattered-1.pdf")
  ).arrayBuffer(),
);
console.log(sha1dc(shattered) === null); // true

// also, you can avoid extra copies for concatenation
const gitBlobHeader = new TextEncoder().encode(
  `blob ${data.length.toString()}\u0000`,
);
console.log(hex(sha1dc([gitBlobHeader, data]))); // 2c3ae82e5e5516b801382fc0efdb50e9a05c2430
```
