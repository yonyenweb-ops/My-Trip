"use client";

import { useRouter } from "next/navigation";
import { Loading } from "@/components/States";
import { TripForm } from "@/components/TripForm";
import { budgetSuggestions } from "@/lib/calc";
import { createTrip, useAppData } from "@/lib/storage";
import { showToast } from "@/lib/toast";

export default function NewTripPage() {
  const router = useRouter();
  // Wait until we're in the browser so "today" uses the phone's time zone, not the server's.
  const data = useAppData();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">New Trip</h1>
        <p className="mt-1 text-muted">Enter how much money you&apos;re bringing. Then add each expense as you go.</p>
      </header>
      {data ? (
        <TripForm
          submitLabel="Create Trip"
          suggestions={budgetSuggestions(data.trips)}
          onSubmit={(input) => {
            createTrip(input);
            showToast(`${input.name} created`);
            router.push("/");
          }}
        />
      ) : (
        <Loading />
      )}
    </div>
  );
}
