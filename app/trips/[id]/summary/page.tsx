"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PlusIcon, ShareIcon } from "@/components/Icons";
import { BackLink, Loading, TripNotFound } from "@/components/States";
import { TripSummary, summaryText } from "@/components/TripSummary";
import { showToast } from "@/lib/toast";
import { useTrip } from "@/lib/useTrip";

async function share(title: string, text: string) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast("Summary copied, paste it anywhere");
  } catch (e) {
    // The user closing the share sheet is not an error.
    if ((e as Error).name !== "AbortError") showToast("Couldn't share on this device");
  }
}

export default function TripSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const state = useTrip(id);

  if (state.loading) return <Loading />;
  const { trip, expenses } = state;
  if (!trip) return <TripNotFound />;

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href={`/trips/${trip.id}`} label="Trip details" />
      <TripSummary trip={trip} expenses={expenses} />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => share(`${trip.name} – Trip Summary`, summaryText(trip, expenses))}
          className="btn-primary"
        >
          <ShareIcon size={18} /> Share Summary
        </button>
        <Link href={`/trips/${trip.id}`} className="btn-secondary">
          All Expenses
        </Link>
        <Link href="/trips/new" className="btn-secondary">
          <PlusIcon size={18} /> New Trip
        </Link>
      </div>
    </div>
  );
}
