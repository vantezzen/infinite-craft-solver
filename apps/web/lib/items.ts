import { PrismaClient } from "@repo/db";

export async function getItemList() {
  const prisma = new PrismaClient();
  const items = await prisma.recipe.groupBy({
    by: ["result"],
  });

  return items.map((item) => item.result);
}
