"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { methodLabel, typeLabel, type PaymentMethod, type PaymentType } from "@/lib/payments";

// "use client" because the form changes as you tap: the month picker only
// shows for Monthly payments, the reference number only for GCash.
// Saving still happens on the server (the `action` passed in).

function Choice<T extends string>({
  name,
  options,
  labels,
  value,
  onChange,
}: {
  name: string;
  options: T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-flow-col gap-2">
      {options.map((option) => (
        <label
          key={option}
          className={`flex h-11 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
            value === option
              ? "border-primary bg-primary/10 text-primary"
              : "border-input hover:bg-secondary"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="sr-only"
          />
          {labels[option]}
        </label>
      ))}
    </div>
  );
}

// Used by Mama Lita ("Record payment") and by boarders ("I paid").
// Boarders can only report monthly payments, so they get monthlyOnly.
export function PaymentForm({
  action,
  cancelHref,
  defaultAmount,
  today,
  thisMonth,
  error,
  monthlyOnly = false,
  submitLabel = "Save payment",
}: {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  defaultAmount: number;
  today: string; // "2026-10-15"
  thisMonth: string; // "2026-10"
  error?: string;
  monthlyOnly?: boolean;
  submitLabel?: string;
}) {
  const [type, setType] = useState<PaymentType>("monthly");
  const [method, setMethod] = useState<PaymentMethod>("cash");

  return (
    <form action={action} className="flex flex-col gap-6">
      {monthlyOnly ? (
        <input type="hidden" name="type" value="monthly" />
      ) : (
        <div className="flex flex-col gap-2">
          <Label>What is it for?</Label>
          <Choice name="type" options={["monthly", "deposit", "advance"]} labels={typeLabel} value={type} onChange={setType} />
        </div>
      )}

      {type === "monthly" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="period">For which month?</Label>
          <Input id="period" name="period" type="month" defaultValue={thisMonth} required />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount (₱)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min={0.01}
            step="0.01"
            defaultValue={defaultAmount}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="paid_on">Date paid</Label>
          <Input id="paid_on" name="paid_on" type="date" defaultValue={today} max={today} required />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>How was it paid?</Label>
        <Choice name="method" options={["cash", "gcash"]} labels={methodLabel} value={method} onChange={setMethod} />
      </div>

      {method === "gcash" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="reference_no">GCash reference number (optional)</Label>
          <Input id="reference_no" name="reference_no" inputMode="numeric" placeholder="e.g. 1012 345 678901" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="received_by">Received by</Label>
        <Input id="received_by" name="received_by" defaultValue="Mama Lita" />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" className="flex-1">
          {submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
