"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

// A submit button that locks itself while the form is being sent.
// On a slow connection people tap again and again; without this, every
// tap would send another request. While sending it shows `pendingText`
// and can't be tapped.
export function SubmitButton({
  children,
  pendingText = "Sending…",
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" {...props} disabled={pending || props.disabled} aria-busy={pending}>
      {pending ? pendingText : children}
    </Button>
  );
}
