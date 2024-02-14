import prisma from "./db";

export default async function getStatus() {
  const recipes = await prisma.recipe.count({
    cacheStrategy: {
      ttl: 60 * 60,
    },
  });
  const items = await prisma.recipe.groupBy({
    by: ["result"],
    cacheStrategy: {
      ttl: 10,
    },
  });
  const queued = await prisma.queueItem.count({
    cacheStrategy: {
      ttl: 10,
    },
  });

  return {
    recipes,
    items: items.length,
    queued,
  };
}
