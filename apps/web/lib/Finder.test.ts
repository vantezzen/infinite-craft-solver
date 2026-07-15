import assert from "node:assert/strict";
import test from "node:test";
import Finder, { Recipe } from "./Finder";

async function findItem(recipes: Recipe[], targetItem: string) {
  // eslint-disable-next-line no-undef
  globalThis.fetch = async () => new Response(JSON.stringify(recipes));

  return new Finder().findItem(targetItem);
}

test("finds short, dependency-ordered crafting paths", async () => {
  const alternatives: Recipe[] = [
    { first: "Fire", second: "Water", result: "Steam" },
    { first: "Steam", second: "Wind", result: "Cloud" },
    { first: "Cloud", second: "Steam", result: "Storm" },
    { first: "Storm", second: "Earth", result: "Goal" },
    { first: "Fire", second: "Water", result: "Shortcut" },
    { first: "Shortcut", second: "Shortcut", result: "Goal" },
  ];

  assert.deepEqual(await findItem(alternatives, "Goal"), [
    alternatives[4],
    alternatives[5],
  ]);

  const deepPath = Array.from({ length: 10_000 }, (_, index) => ({
    first: "Fire",
    second: index === 0 ? "Water" : `Item ${index - 1}`,
    result: `Item ${index}`,
  }));
  assert.equal((await findItem(deepPath, "Item 9999")).length, 10_000);
});
