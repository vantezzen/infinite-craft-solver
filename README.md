# Infinite Craft Solver

This project allows searching for the quickest way to craft a given item in the game [Infinite Craft](https://neal.fun/infinite-craft/).

Visit <https://ics.vantezzen.io> to use the solver.

## Dataset

Internally, this project uses a dataset of over 200k recipes fetched from the worker (see `packages/worker`). Feel free to download and use the dataset for your own projects.

To use the dataset, download the compressed recipe list from <https://icscdn.vantezzen.io/recipes.json>. You can use the function in `apps/web/lib/compression.ts` to decompress the file and get an array of object in the format `{ first: string, second: string, result: string }`. As used by Infinite Craft, `first` and `second` are sorted alphabetically to allow for easier searching.

### Compression

The dataset uses a simple compression method to reduce repetition of strings. For this, the compression file is a JSON object with the array "`items`" containing all unique item names and the array "`recipes`" containing all recipes. Each recipe is an array of three numbers, the first two being the index of the first and second item in the "`items`" array and the third being the index of the result item in the "`items`" array.

With this, the dataset can be uncompressed by iterating over the "`recipes`" array and using the numbers to get the item names from the "`items`" array:

```ts
function decompressRecipes({
  items,
  recipes,
}: {
  items: string[];
  recipes: any[];
}): Recipe[] {
  return recipes.map((recipe) => ({
    first: items[recipe[0]]!,
    second: items[recipe[1]]!,
    result: items[recipe[2]]!,
  }));
}

const recipes = decompressRecipes(compressedData);
```

## Development

```sh
npm install
npm run dev
```
