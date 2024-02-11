import { Edge } from "@repo/db";

export async function getItemList() {
  const prisma = new Edge.PrismaClient();
  const items = await prisma.recipe.groupBy({
    by: ["result"],
  });

  return items.map((item) => item.result);
}
