"use client"

import {
  BadgeCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonAlertIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Theme comes from the caller (use-theme hook) — no next-themes needed.
const Toaster = ({ theme = 'light', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      expand
      closeButton
      gap={10}
      offset={16}
      duration={4200}
      icons={{
        success: <BadgeCheckIcon className="size-4.5" strokeWidth={2.2} />,
        info: <InfoIcon className="size-4.5" strokeWidth={2.2} />,
        warning: <TriangleAlertIcon className="size-4.5" strokeWidth={2.2} />,
        error: <OctagonAlertIcon className="size-4.5" strokeWidth={2.2} />,
        loading: <Loader2Icon className="size-4.5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: '!rounded-xl !px-4 !py-3.5 !gap-3 !font-sans !items-start',
          title: '!text-[13px] !font-semibold !text-text-strong !leading-snug',
          description: '!text-xs !text-text-soft !leading-snug !mt-0.5',
          actionButton: '!bg-brand-blue !text-white !rounded-lg !text-xs',
          cancelButton: '!bg-surface-strong !text-text-soft !rounded-lg !text-xs',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
