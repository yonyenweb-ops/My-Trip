"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExpenseList } from "@/components/ExpenseList";
import { ActionMenu } from "@/components/ActionMenu";
import { CameraIcon, CheckIcon, CloseIcon, PencilIcon, ReportIcon, TrashIcon, UndoIcon } from "@/components/Icons";
import { BackLink, Loading, TripNotFound } from "@/components/States";
import { StatusBadge } from "@/components/TripCard";
import { TripOverview } from "@/components/TripOverview";
import { TripPhoto } from "@/components/TripPhoto";
import { formatDateRange } from "@/lib/dates";
import { closeTrip, deleteTrip, reopenTrip, setTripPhoto } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import { useTrip } from "@/lib/useTrip";
import { useTripPhotoPicker } from "@/lib/useTripPhotoPicker";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const state = useTrip(id);
  const [confirm, setConfirm] = useState<"close" | "delete" | "removePhoto" | null>(null);
  const photoPicker = useTripPhotoPicker(id);

  if (state.loading) return <Loading />;
  const { trip, expenses } = state;
  if (!trip) return <TripNotFound />;
  const active = trip.status === "active";

  return (
    <>
      <BackLink href="/trips" label="My Trips" />
      {photoPicker.input}

      {trip.photo && <TripPhoto photoId={trip.photo} className="mb-4 h-44 rounded-[28px] sm:h-56" />}

      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="min-w-0 truncate text-2xl font-bold tracking-tight md:text-3xl">{trip.name}</h1>
            <StatusBadge status={trip.status} />
          </div>
          <p className="text-sm text-muted">{formatDateRange(trip.startDate, trip.endDate)}</p>
          {trip.note && <p className="mt-2 whitespace-pre-line text-muted">{trip.note}</p>}
        </div>
        <ActionMenu
          label="Trip actions"
          items={[
            { label: "Edit trip", Icon: PencilIcon, href: `/trips/${trip.id}/edit` },
            { label: "Trip summary", Icon: ReportIcon, href: `/trips/${trip.id}/summary` },
            // Photos live here, not in the trip form, to keep that form focused.
            { label: trip.photo ? "Change photo" : "Add photo", Icon: CameraIcon, onClick: photoPicker.choose },
            ...(trip.photo ? [{ label: "Remove photo", Icon: CloseIcon, onClick: () => setConfirm("removePhoto") }] : []),
            active
              ? { label: "Close trip", Icon: CheckIcon, onClick: () => setConfirm("close") }
              : {
                  label: "Reopen trip",
                  Icon: UndoIcon,
                  onClick: () => {
                    reopenTrip(trip.id);
                    showToast("Trip reopened");
                  },
                },
            { label: "Delete trip", Icon: TrashIcon, onClick: () => setConfirm("delete"), danger: true },
          ]}
        />
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-8">
          <TripOverview
            trip={trip}
            expenses={expenses}
            action={active ? <AddExpenseButton tripId={trip.id} variant="inline" /> : undefined}
          />
          {/* A closed trip's main next step is its summary, so that one stays visible. */}
          {!active && (
            <Link href={`/trips/${trip.id}/summary`} className="btn-primary h-14 w-full">
              <ReportIcon size={18} /> View Trip Summary
            </Link>
          )}
        </div>

        <section>
          <h2 className="section-title mb-3">
            Expense history <span className="font-normal text-faint">· {expenses.length}</span>
          </h2>
          <ExpenseList expenses={expenses} editable={active} />
          {!active && expenses.length > 0 && (
            <p className="mt-3 text-center text-xs text-faint">Reopen the trip to edit expenses.</p>
          )}
        </section>
      </div>

      {active && (
        <>
          <div className="h-20 md:hidden" aria-hidden />
          <AddExpenseButton tripId={trip.id} variant="floating" />
        </>
      )}

      {confirm === "close" && (
        <ConfirmDialog
          title="Close this trip?"
          message="The trip will be marked as completed and you'll see the final summary. You can reopen it later if needed."
          confirmLabel="Close Trip"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            closeTrip(trip.id);
            router.push(`/trips/${trip.id}/summary`);
          }}
        />
      )}
      {confirm === "removePhoto" && (
        <ConfirmDialog
          title="Remove photo?"
          message="The trip keeps all its money and expenses. Only the photo is removed."
          confirmLabel="Remove"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setTripPhoto(trip.id, undefined);
            setConfirm(null);
            showToast("Photo removed");
          }}
        />
      )}
      {confirm === "delete" && (
        <ConfirmDialog
          title="Delete this trip?"
          message={`"${trip.name}" and all ${expenses.length} of its expenses will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            router.replace("/trips");
            deleteTrip(trip.id);
            showToast("Trip deleted");
          }}
        />
      )}
    </>
  );
}
