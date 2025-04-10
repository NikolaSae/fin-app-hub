// app/(protected)/complaints/new/page.tsx - Stranica za kreiranje nove reklamacije
import { redirect } from "next/navigation";
import { auth } from "@/auth"
import { getAllProducts } from "@/data/product";
import { ComplaintForm } from "@/components/complaints/complaint-form";

export default async function NewComplaintPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const products = await getAllProducts();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">Nova reklamacija</h1>
      <ComplaintForm products={products} />
    </div>
  );
}