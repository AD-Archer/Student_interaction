// dialog.tsx
// Simple Dialog component for modal usage in the app. Used for email type selection and other confirmations.
import * as React from "react"

export function Dialog({ open, onOpenChange, children }: { open: boolean, onOpenChange: () => void, children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={onOpenChange}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <div className="font-semibold text-lg">{children}</div>
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex gap-2">{children}</div>
}
