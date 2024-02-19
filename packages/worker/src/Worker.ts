import { PrismaClient } from "@repo/db";
import { ApiRecipe } from "./types";
import puppeteer, { type Page } from "puppeteer";

const DEFAULT_ITEMS = ["Water", "Fire", "Wind", "Earth"];
const THREAD_COUNT = 10;

export default class Worker {
  private prisma = new PrismaClient();
  private page: Page | null = null;

  public async run() {
    console.log("Worker started");

    const hasExistingRecipes = (await this.prisma.recipe.count()) > 0;
    if (!hasExistingRecipes) {
      console.log("No existing recipes found, kickstarting");
      await this.kickstart();
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await browser.newPage();
    await this.page.goto("https://neal.fun/infinite-craft/");
    await this.page.waitForSelector(".mobile-sound");

    for (let i = 0; i < THREAD_COUNT; i++) {
      await this.runThread();
    }

    await browser.close();

    console.log("Worker finished");
  }

  private async runThread() {
    while (true) {
      const recipeCount = await this.prisma.queueItem.count();
      const skip = Math.floor(Math.random() * recipeCount);
      const item = await this.prisma.queueItem.findFirst({
        skip,
      });
      if (!item) {
        console.log("No items in queue - stopping worker");
        return;
      }

      const exitClean = () => {
        console.log("Exiting cleanly");

        // Re-add current queue item to the end of the queue so we don't lose it
        this.prisma.queueItem.create({
          data: {
            first: item.first,
            second: item.second,
          },
        });

        console.log("Re-added item to queue");
      };
      process.on("SIGINT", exitClean);

      await this.prisma.queueItem.delete({
        where: {
          id: item.id,
        },
      });

      try {
        await this.findOutRecipe(item.first, item.second);
      } catch (e) {
        console.error("Failed to fetch recipe", e, item);
      }

      process.off("SIGINT", exitClean);
    }
  }

  private async findOutRecipe(first: string, second: string) {
    // Sort first and second alphabetically so we don't have to worry about the order
    const [a, b] = [first, second].sort((a, b) => a.localeCompare(b)) as [
      string,
      string,
    ];

    const baseUrl = `https://neal.fun/api/infinite-craft/pair`;
    const url = `${baseUrl}?first=${a}&second=${b}`;

    const data = await this.fetch(url);

    if (!data) {
      console.error(`Failed to fetch recipe: ${url}`);
      return;
    }

    console.log(`Found recipe`, data.result);

    const hasExistingRecipeForResult =
      (await this.prisma.recipe.findFirst({
        where: {
          result: data.result,
        },
      })) !== null;

    const hasExistingRecipeForCombination =
      (await this.prisma.recipe.findFirst({
        where: {
          first: a,
          second: b,
        },
      })) !== null;

    if (!hasExistingRecipeForCombination) {
      console.log(`Adding combination: ${a} + ${b} = ${data.result}`);
      await this.prisma.recipe.create({
        data: {
          first: a,
          second: b,
          result: data.result,
        },
      });
    }

    if (!hasExistingRecipeForResult) {
      console.log(`New item found: ${data.result}`);

      if (!data.isNew) {
        this.queueCombinationsWithItem(data.result).then(() => {
          console.log(`Queued combinations for ${data.result}`);
        });
      } else {
        console.log(`Item is new, not queueing combinations`);
      }
    }
  }

  private async fetch(url: string) {
    const data = (await this.page!.evaluate((url) => {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then((response) => {
            return response.json();
          })
          .then(function (data) {
            resolve(data);
          })
          .catch((error) => {
            resolve(null);
          });
      });
    }, url)) as ApiRecipe | null;

    return data;
  }

  private async queueCombinationsWithItem(item: string) {
    const existingItemsResult = await this.prisma.recipe.groupBy({
      by: "result",
    });
    const existingItems = [
      ...existingItemsResult.map((item) => item.result),
      ...DEFAULT_ITEMS,
      item,
    ];

    for (const existingItem of existingItems) {
      if (existingItem === item) {
        continue;
      }

      const existingResult = await this.prisma.recipe.findFirst({
        where: {
          first: item,
          second: existingItem,
        },
      });
      if (existingResult) {
        continue;
      }

      const existingCombination = await this.prisma.queueItem.findFirst({
        where: {
          first: item,
          second: existingItem,
        },
      });
      if (existingCombination) {
        continue;
      }

      await this.prisma.queueItem.create({
        data: {
          first: item,
          second: existingItem,
        },
      });
    }
  }

  private async kickstart() {
    for (const item of DEFAULT_ITEMS) {
      await this.queueCombinationsWithItem(item);
    }
  }
}
