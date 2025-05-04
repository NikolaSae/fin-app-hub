// Path: app/(protected)/complaints/new/page.tsx

// Path: app/(protected)/complaints/new/page.tsx

// REMOVE "use client";
import { auth } from "@/auth";
import { Metadata } from "next";
import { getProviders } from "@/actions/complaints/providers";
import { ComplaintFormWrapper } from "@/components/complaints/ComplaintFormWrapper";


export const metadata: Metadata = {
  title: "Submit New Complaint",
  description: "Form to submit a new complaint",
};


export default async function NewComplaintPage() {
  const providersData = await getProviders();

  return (
    <ComplaintFormWrapper providersData={providersData} />
  );
}