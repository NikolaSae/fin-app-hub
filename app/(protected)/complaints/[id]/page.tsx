// app/(protected)/complaints/[id]/page.tsx


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Send } from "lucide-react";
// ISPRAVLJENO: Promenjen uvoz za StatusBadge na podrazumevani
import StatusBadge from "@/components/complaints/StatusBadge";
// ISPRAVLJENO: Promenjen uvoz za CommentSection na podrazumevani
import CommentSection from "@/components/complaints/CommentSection";
import { ComplaintTimeline } from "@/components/complaints/ComplaintTimeline";
import { FileUpload } from "@/components/complaints/FileUpload";
import { AmountSummary } from "@/components/complaints/AmountSummary";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { useComplaints } from "@/hooks/use-complaints";
import { toast } from "sonner";
// ISPRAVLJENO: Promenjen uvoz imena funkcije iz change-status akcije
import { changeComplaintStatus } from "@/actions/complaints/change-status";
import { ComplaintStatus } from "@prisma/client"; // Uvoz ComplaintStatus iz Prisma klijenta
import { formatDate } from "@/lib/utils"; // Proverite da li ova putanja ispravno uvozi formatDate
import { addComment } from "@/actions/complaints/comment"; // Proverite da li ova putanja ispravno uvozi addComment
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { deleteComplaint } from "@/actions/complaints/delete"; // Proverite da li ova putanja ispravno uvozi deleteComplaint
// TODO: Uvezite useSession hook da biste dobili currentUserId i userRole
// import { useSession } from "next-auth/react";


export default function ComplaintDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  // Prosleđujemo id useComplaints hooku
  const { complaint, isLoading, error, refresh } = useComplaints({ id: id as string });

  // TODO: Dohvatite sesiju da biste dobili ID i rolu trenutnog korisnika
  // const { data: session } = useSession();
  // const currentUserId = session?.user?.id;
  // const userRole = session?.user?.role; // Pretpostavljajući da rola postoji na user objektu sesije

  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error("Error loading complaint details");
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        Loading complaint...
      </div>
    );
  }

  // Prikazujemo 404 samo ako nije isLoading I complaint je null
  if (!complaint && !isLoading) {
    notFound();
  }

  // Funkcija za promenu statusa
  const handleChangeStatus = async (newStatus: ComplaintStatus) => {
    // Dodajemo proveru da li complaint postoji pre promene statusa
    if (!complaint) {
        toast.error("Complaint data not available to change status.");
        return;
    }
    try {
      setIsChangingStatus(true);
      // ISPRAVLJENO: Prosleđujemo objekat sa complaintId i statusom
      const result = await changeComplaintStatus({
        complaintId: complaint.id,
        status: newStatus,
        // notes: Optionally add notes here if you implement a notes input for status changes
      });

      if (result?.success) { // Proveravamo da li result postoji pre pristupa success
        toast.success("Status updated successfully");
        refresh(); // Osvežavamo podatke o pritužbi
      } else {
        toast.error(result?.error || "Failed to update status"); // Proveravamo da li result postoji
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleCommentSubmit = async () => {
    // Dodajemo proveru da li complaint postoji pre dodavanja komentara
    if (!complaint || !newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      // Proverite da li addComment akcija prihvata ovaj format argumenata
      // Prema vašem CommentSection.tsx fajlu, addComment se poziva sa complaintId, text, isInternal
      // Morate uskladiti poziv ovde sa očekivanim argumentima akcije
      // Ažurirao sam CommentSection da koristi objekat { complaintId, text, isInternal }
      // pa bi ovaj poziv trebao da bude ispravan ako ste koristili tu verziju CommentSection
      const result = await addComment({
        complaintId: complaint.id, // Koristimo complaint.id
        text: newComment,
        isInternal: false // Ili dodajte checkbox za ovo ako je potrebno na detaljima
      });

      if (result?.success) { // Proveravamo da li result postoji
        toast.success("Comment added successfully");
        setNewComment("");
        refresh(); // Osvežavamo podatke o pritužbi da se prikaže novi komentar
      } else {
        toast.error(result?.error || "Failed to add comment"); // Proveravamo da li result postoji
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    // Dodajemo proveru da li complaint postoji pre brisanja
    if (!complaint) {
        toast.error("Complaint data not available to delete.");
        setIsDeleteDialogOpen(false);
        return;
    }
    try {
      setIsDeleting(true);
      // Proverite da li deleteComplaint akcija prihvata samo id
      const result = await deleteComplaint(complaint.id); // Koristimo complaint.id

      if (result?.success) { // Proveravamo da li result postoji
        toast.success("Complaint deleted successfully");
        router.push("/complaints"); // Preusmeravamo na listu nakon uspešnog brisanja
      } else {
        toast.error(result?.error || "Failed to delete complaint"); // Proveravamo da li result postoji
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Ako complaint još uvek nije učitan ili je došlo do greške, ne renderujemo ostatak
  if (!complaint) {
    return null; // Ili prikažite neku generičku poruku/loader ako želite
  }

  // --- Početak glavnog renderovanja kada je complaint učitan ---
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{complaint.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/complaints/${complaint.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-lg shadow">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-sm">{complaint.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={complaint.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Priority:</span>
                <span className="font-medium">{complaint.priority}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(complaint.createdAt)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.financialImpact !== null && complaint.financialImpact !== undefined && (
              <>
                <Separator className="my-4" />
                <AmountSummary amount={complaint.financialImpact} />
              </>
            )}
          </div>

          <div className="bg-card p-6 rounded-lg shadow">
            <Tabs defaultValue="comments">
              <TabsList className="mb-4">
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-4">
                <CommentSection
                  complaintId={complaint.id}
                  comments={complaint.comments || []}
                  currentUserId={"YOUR_CURRENT_USER_ID"}
                  userRole={"YOUR_USER_ROLE"}
                />
              </TabsContent>

              <TabsContent value="timeline">
                <ComplaintTimeline statusHistory={complaint.statusHistory || []} />
              </TabsContent>

              <TabsContent value="attachments">
                <FileUpload
                  complaintId={complaint.id}
                  existingAttachments={complaint.attachments || []}
                  onUploadComplete={refresh}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Details</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted By</p>
                <p>{complaint.submittedBy?.name || 'Unknown'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                <p>{complaint.assignedAgent?.name || 'Not assigned'}</p>
              </div>

              {complaint.service && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service</p>
                  <p>{complaint.service.name}</p>
                </div>
              )}

              {complaint.product && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Product</p>
                  <p>{complaint.product.name}</p>
                </div>
              )}

              {complaint.provider && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Provider</p>
                  <p>{complaint.provider.name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isChangingStatus || complaint.status === ComplaintStatus.ASSIGNED}
                  onClick={() => handleChangeStatus(ComplaintStatus.ASSIGNED)}
                >
                  Assign
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isChangingStatus || complaint.status === ComplaintStatus.IN_PROGRESS}
                  onClick={() => handleChangeStatus(ComplaintStatus.IN_PROGRESS)}
                >
                  Mark as In Progress
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isChangingStatus || complaint.status === ComplaintStatus.RESOLVED}
                  onClick={() => handleChangeStatus(ComplaintStatus.RESOLVED)}
                >
                  Mark as Resolved
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isChangingStatus || complaint.status === ComplaintStatus.CLOSED}
                  onClick={() => handleChangeStatus(ComplaintStatus.CLOSED)}
                >
                  Close Complaint
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isChangingStatus || complaint.status === ComplaintStatus.REJECTED}
                  onClick={() => handleChangeStatus(ComplaintStatus.REJECTED)}
                >
                  Reject Complaint
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}