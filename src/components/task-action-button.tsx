"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function TaskActionButton({
  children,
  pendingLabel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      aria-disabled={pending || props.disabled}
    >
      {pending ? pendingLabel ?? children : children}
    </Button>
  );
}
