"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button"; // assuming shadcn button

export default function TermsPrompt({ hasAcceptedTerms, onAccept, onReject,terms  } : any) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasAcceptedTerms) {
      // Wait 2 seconds before showing
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasAcceptedTerms]);

  return (
   <Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Portal>
    {/* Background overlay */}
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />

    {/* Main content */}
    <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-full -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-6 shadow-lg">
      <Dialog.Title className="text-lg font-semibold mb-2">
        Forum Terms & Conditions
      </Dialog.Title>

      <Dialog.Description className="text-sm text-orange-400 mb-4">
        Please read and accept the forum terms before continuing.
      </Dialog.Description>

      {/* Scrollable terms box */}
      <div className="bg-muted p-4 rounded-md text-sm max-h-56 overflow-auto border border-border">
        {terms}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <Button
          className="bg-orange-400 hover:bg-orange-500 text-white"
          onClick={() => {
            onAccept();
            setOpen(false);
          }}
        >
          Accept
        </Button>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => {
            onReject();
            setOpen(false);
          }}
        >
          Reject & Exit Forum
        </Button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
  );
}
