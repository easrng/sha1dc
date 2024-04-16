/** @type {typeof import("bun:test").test | typeof import("node:test").test} */
export let test;
if(typeof Bun === "undefined") {
    test = (await import("node:test")).test
} else {
    test = (await import("bun:test")).test
}