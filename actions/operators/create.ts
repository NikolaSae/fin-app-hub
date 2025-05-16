// actions/operators/create.ts

"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OperatorFormValues } from "@/lib/types/operator-types";
import { operatorSchema } from "@/schemas/operator";
import { revalidatePath } from "next/cache";

export async function createOperator(data: OperatorFormValues) {
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
    
    // Check if operator with the same code already exists
    const existingOperator = await db.operator.findUnique({
      where: { code },
    });
    
    if (existingOperator) {
      return { error: "An operator with this code already exists" };
    }
    
    // Create the operator
    const operator = await db.operator.create({
      data: {
        name,
        code,
        description,
        logoUrl,
        website,
        contactEmail,
        contactPhone,
        active: active ?? true,
      },
    });
    
    // Revalidate the operators list
    revalidatePath("/operators");
    
    return { success: true, data: operator };
    
  } catch (error) {
    console.error("Error creating operator:", error);
    return { error: "Failed to create operator" };
  }
}