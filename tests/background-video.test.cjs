const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const script = readFileSync(require.resolve("../script.js"), "utf8");
const settle = () => new Promise((resolve) => setImmediate(resolve));

class Element {
  constructor() {
    this.listeners = new Map();
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
    };
  }
  addEventListener(name, callback) {
    const listeners = this.listeners.get(name) || [];
    listeners.push(callback);
    this.listeners.set(name, listeners);
  }
  emit(name) {
    for (const callback of this.listeners.get(name) || []) callback({});
  }
}

function setup({ source = "video/test.mp4", reduced = false, saveData = false } = {}) {
  const video = new Element();
  video.dataset = { src: source };
  video.paused = true;
  video.playCalls = 0;
  video.loadCalls = 0;
  video.hasAttribute = (name) => name === "src" && Boolean(video.src);
  video.play = () => {
    video.playCalls++;
    if (video.playError) return Promise.reject(video.playError);
    video.paused = false;
    video.emit("playing");
    return Promise.resolve();
  };
  video.pause = () => {
    if (!video.paused) {
      video.paused = true;
      video.emit("pause");
    }
  };
  video.load = () => video.loadCalls++;

  const toggle = new Element();
  toggle.hidden = true;
  const status = new Element();
  status.textContent = "";
  const frame = new Element();
  frame.querySelector = (selector) => selector === "video" ? video : toggle;
  frame.parentElement = { querySelector: () => status };
  const menu = new Element();
  const nav = new Element();
  const document = new Element();
  document.hidden = false;
  document.documentElement = new Element();
  document.querySelectorAll = () => [frame];
  document.querySelector = (selector) => ({
    ".menu-toggle": menu,
    "#primary-nav": nav,
    "#year": {},
  })[selector];
  const preference = new Element();
  preference.matches = reduced;
  const connection = new Element();
  connection.saveData = saveData;
  let intersection;
  runInNewContext(script, {
    document,
    navigator: { connection },
    window: { matchMedia: (query) => query.includes("reduced-motion") ? preference : new Element() },
    IntersectionObserver: class {
      constructor(callback) { intersection = callback; }
      observe() {}
    },
  });
  return {
    video, toggle, status, frame, preference, connection, document,
    hasObserver: () => Boolean(intersection),
    intersect: (isIntersecting) => intersection([{ isIntersecting }]),
  };
}

test("an unconfigured video never loads or exposes a nonfunctional control", () => {
  const state = setup({ source: "" });
  assert.equal(state.video.src, undefined);
  assert.equal(state.video.playCalls, 0);
  assert.equal(state.toggle.hidden, true);
  assert.equal(state.hasObserver(), false);
});

test("video loads only in view and pauses offscreen or in a hidden tab", async () => {
  const state = setup();
  assert.equal(state.video.src, undefined);
  state.intersect(true);
  await settle();
  assert.equal(state.video.src, "video/test.mp4");
  assert.equal(state.video.muted, true);
  assert.equal(state.video.defaultMuted, true);
  assert.equal(state.frame.classList.contains("has-video"), true);
  state.intersect(false);
  assert.equal(state.video.paused, true);
  state.intersect(true);
  await settle();
  assert.equal(state.video.paused, false);
  state.document.hidden = true;
  state.document.emit("visibilitychange");
  assert.equal(state.video.paused, true);
  state.document.hidden = false;
  state.document.emit("visibilitychange");
  await settle();
  assert.equal(state.video.paused, false);
});

test("a manual pause survives viewport and tab changes until Play is selected", async () => {
  const state = setup();
  state.intersect(true);
  await settle();
  state.toggle.emit("click");
  const calls = state.video.playCalls;
  state.intersect(false);
  state.intersect(true);
  state.document.emit("visibilitychange");
  await settle();
  assert.equal(state.video.paused, true);
  assert.equal(state.video.playCalls, calls);
  state.toggle.emit("click");
  await settle();
  assert.equal(state.video.paused, false);
});

for (const preference of ["reduced", "saveData"]) {
  test(`${preference} prevents loading; explicit Play opts in until preferences change`, async () => {
    const state = setup({ [preference]: true });
    state.intersect(true);
    await settle();
    assert.equal(state.video.src, undefined);
    assert.equal(state.video.playCalls, 0);
    assert.match(state.status.textContent, /motion is off/);
    state.toggle.emit("click");
    await settle();
    assert.equal(state.video.paused, false);
    state.preference.emit("change");
    assert.equal(state.video.paused, true);
    assert.equal(state.frame.classList.contains("has-video"), false);
  });
}

test("autoplay denial and media errors show the image and allow a deliberate retry", async () => {
  const state = setup();
  state.video.playError = Object.assign(new Error("Blocked"), { name: "NotAllowedError" });
  state.intersect(true);
  await settle();
  assert.equal(state.frame.classList.contains("has-video"), false);
  assert.match(state.status.textContent, /could not play/);
  assert.equal(state.toggle.textContent, "Retry background video");
  state.video.playError = null;
  state.toggle.emit("click");
  await settle();
  assert.equal(state.video.loadCalls, 1);
  assert.equal(state.video.paused, false);
  assert.equal(state.status.textContent, "");
  state.video.emit("error");
  assert.equal(state.video.paused, true);
  assert.equal(state.frame.classList.contains("has-video"), false);
  assert.match(state.status.textContent, /still image/);
});

test("a preference change during a pending play restores the still image", async () => {
  const state = setup();
  let finishPlay;
  state.video.play = () => {
    state.video.paused = false;
    return new Promise((resolve) => { finishPlay = resolve; });
  };
  state.intersect(true);
  state.preference.matches = true;
  state.preference.emit("change");
  finishPlay();
  state.video.emit("playing");
  await settle();
  assert.equal(state.video.paused, true);
  assert.equal(state.frame.classList.contains("has-video"), false);
  assert.match(state.status.textContent, /motion is off/);
});

test("quickly leaving and reentering the viewport restarts an interrupted play without an error", async () => {
  const state = setup();
  const play = state.video.play;
  const pause = state.video.pause;
  let interruptPlay;
  state.video.play = () => {
    state.video.playCalls++;
    state.video.paused = false;
    state.video.play = play;
    return new Promise((resolve, reject) => {
      interruptPlay = () => reject(Object.assign(new Error("Interrupted"), { name: "AbortError" }));
    });
  };
  state.video.pause = () => {
    pause();
    if (interruptPlay) interruptPlay();
  };
  state.intersect(true);
  state.intersect(false);
  state.intersect(true);
  await settle();
  assert.equal(state.video.playCalls, 2);
  assert.equal(state.video.paused, false);
  assert.equal(state.status.textContent, "");
  assert.equal(state.frame.classList.contains("has-video"), true);
});
