import prisma from "./db";

export async function getItemList() {
  const items = await prisma.recipe.groupBy({
    by: ["result"],
  });

  return items.map((item) => item.result);
}
