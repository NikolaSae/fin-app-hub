// app/(protected)/operators/new/page.tsx

import { Metadata } from "next";
import { redirect } from "next/navigation";

import { OperatorForm } from "@/components/operators/OperatorForm";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserRole } from "@/lib/auth/auth-utils";
import { UserRole } from "@prisma/client";

export const metadata: Metadata = {
  title: "New Operator",
  description: "Create a new operator in the system.",
};

export default async function NewOperatorPage() {
  const userRole = await getUserRole();
  
  // Only ADMIN and MANAGER can create operators
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
    redirect("/dashboard");
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create New Operator"
        text="Add a new operator to the system"
      >
        <Button asChild variant="outline">
          <Link href="/operators">Cancel</Link>
        </Button>
      </DashboardHeader>
      <div className="grid gap-8">
        <OperatorForm />
      </div>
    </DashboardShell>
  );
}