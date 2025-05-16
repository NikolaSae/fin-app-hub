// actions/operators/update.ts

"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OperatorFormValues } from "@/lib/types/operator-types";
import { operatorSchema } from "@/schemas/operator";
import { revalidatePath } from "next/cache";

export async function updateOperator(operatorId: string, data: OperatorFormValues) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { error: "Unauthorized" };
    }
    
    // Validate form data
    const validatedData = operatorSchema.safeParse(data);
    
    if (!validatedData.success) {
      return { error: "Invalid operator data", errors: validatedData.error.format() };
    }
    
    const { name, code, description, logoUrl, website, contactEmail, contactPhone, active } = validatedData.data;
    
    // Check if the operator exists
    const existingOperator = await db.operator.findUnique({
      where: { id: operatorId },
    });
    
    if (!existingOperator) {
      return { error: "Operator not found" };
    }
    
    // Check if code is being changed and if new code already exists
    if (code !== existingOperator.code) {
      const operatorWithCode = await db.operator.findUnique({
        where: { code },
      });
      
      if (operatorWithCode) {
        return { error: "An operator with this code already exists" };
      }
    }
    
    // Update the operator
    const operator = await db.operator.update({
      where: { id: operatorId },
      data: {
        name,
        code,
        description,
        logoUrl,
        website,
        contactEmail,
        contactPhone,
        active,
      },
    });
    
    // Revalidate the operators list and detail pages
    revalidatePath("/operators");
    revalidatePath(`/operators/${operatorId}`);
    
    return { success: true, data: operator };
    
  } catch (error) {
    console.error("Error updating operator:", error);
    return { error: "Failed to update operator" };
  }
}