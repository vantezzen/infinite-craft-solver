import { Edge } from "@repo/db";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new Edge.PrismaClient().$extends(withAccelerate());
export default prisma;
