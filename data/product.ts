// data/product.ts
import { db } from "@/lib/db";

export const getAllProducts = async () => {
  try {
    const products = await db.product.findMany({
      orderBy: {
        name: "asc",
      },
    });
    
    return products;
  } catch (error) {
    console.error("[GET_ALL_PRODUCTS]", error);
    return [];
  }
};