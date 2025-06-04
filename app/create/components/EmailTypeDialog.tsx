// EmailTypeDialog.tsx
// This component renders a modal dialog for selecting the type of follow-up email to send (student or staff).
// It is used by the FollowUpCard to prompt the user before sending a test or real follow-up email.
// The dialog is controlled by parent state and calls the provided callback with the selected type.

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface EmailTypeDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (type: "student" | "staff") => void
}

export function EmailTypeDialog({ open, onClose, onSelect }: EmailTypeDialogProps) {
  if (!open) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Email Recipient</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Button variant="outline" onClick={() => onSelect("student")}>Send to Student</Button>
          <Button variant="outline" onClick={() => onSelect("staff")}>Send to Staff</Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
