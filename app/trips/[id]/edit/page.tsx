"use client";

import { useParams, useRouter } from "next/navigation";
import { BackLink, Loading, TripNotFound } from "@/components/States";
import { TripForm } from "@/components/TripForm";
import { updateTrip } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import { useTrip } from "@/lib/useTrip";

export default function EditTripPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const state = useTrip(id);

  if (state.loading) return <Loading />;
  const { trip } = state;
  if (!trip) return <TripNotFound />;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href={`/trips/${trip.id}`} label={trip.name} />
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Edit Trip</h1>
      <TripForm
        trip={trip}
        submitLabel="Save Changes"
        onSubmit={(input) => {
          updateTrip(trip.id, input);
          showToast("Trip updated");
          router.push(`/trips/${trip.id}`);
        }}
      />
    </div>
  );
}
