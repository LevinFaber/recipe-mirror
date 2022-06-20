import { prisma } from "~/db.server";

export async function getCategories() {
  return prisma.tag.findMany({
    select: { id: true, name: true, slug: true, _count: {
      select: {
        recipes: true
      }
    } },
  })
}

export async function getCategory(slug: string) {
  return prisma.tag.findFirst({
    where: {
      slug,
    },
    select: { id: true, name: true, slug: true, recipes: {
      select: {
        slug: true,
        name: true,
      }
    }, _count: {
      select: {
        recipes: true
      }
    } },
  })
}
