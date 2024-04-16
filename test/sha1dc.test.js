import { test } from "./cross-test.js";
import { readdirSync, readFileSync } from "node:fs";
import { equal } from "node:assert/strict";
import { Buffer } from "node:buffer";
import { sha1dc } from "../src/index.js";

const base = new URL("./fixtures/", import.meta.url)
for (const entry of readdirSync(base).sort()) {
  test(entry, () => {
    const [expectedHashStr] = entry.split(/[-\.]/g);
    const hash = sha1dc(new Uint8Array(readFileSync(new URL(entry, base))));
    equal(hash ? Buffer.from(hash).toString("hex") : "shattered", expectedHashStr);
  })
}