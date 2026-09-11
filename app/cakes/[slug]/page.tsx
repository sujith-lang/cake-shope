import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { CakeDetailsClient } from "./cake-details-client"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, shortDescription: true },
  })
  if (!product) return { title: "Cake Not Found" }
  return {
    title: `${product.name} | Sweet Delights Bakery`,
    description: product.shortDescription || "Delicious handcrafted cake by Sweet Delights Bakery",
  }
}

export default async function CakeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isApproved: true },
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!product || !product.isActive) {
    notFound()
  }

  // Fetch related products in the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: {
      category: { select: { name: true, slug: true } },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
  })

  const formattedRelated = relatedProducts.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
        : 5
    return {
      ...p,
      averageRating: Number(avgRating.toFixed(1)),
      reviewCount: p.reviews.length,
    }
  })

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 5

  const formattedProduct = {
    ...product,
    averageRating: Number(avgRating.toFixed(1)),
    reviewCount: product.reviews.length,
  }

  return (
    <CakeDetailsClient
      product={formattedProduct}
      relatedProducts={formattedRelated}
    />
  )
}
