// app/(protected)/complaints/new/page.tsx - Stranica za kreiranje nove reklamacije
import { redirect } from "next/navigation";
import { auth } from "@/auth"
import { getAllProducts } from "@/data/product";
import { getAllUsers } from "@/data/user"; // Add this import
import { ComplaintForm } from "@/components/complaints/complaint-form";

export default async function NewComplaintPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect("/auth/login");
  }
  
  // Fetch both products and users
  const [products, users] = await Promise.all([
    getAllProducts(),
    getAllUsers() // You'll need to create this function
  ]);
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">Nova reklamacija</h1>
      <ComplaintForm products={products} users={users} />
    </div>
  );
}