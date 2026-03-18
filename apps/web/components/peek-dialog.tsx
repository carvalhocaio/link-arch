"use client";

import { ExternalLink, Loader2, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePeekUrl } from "@/hooks/use-peek-url";

interface PeekDialogProps {
  urlKey: string | null;
  onClose: () => void;
}

export function PeekDialog({ urlKey, onClose }: PeekDialogProps) {
  const { data, isLoading, isError, error } = usePeekUrl(urlKey);

  return (
    <Dialog open={!!urlKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>URL Details</DialogTitle>
          <DialogDescription>
            Preview information for this short URL.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <p className="py-4 text-center text-xs text-destructive">
            {error?.message ?? "Failed to load URL details"}
          </p>
        )}

        {data && (
          <div className="min-w-0 space-y-3">
            <div className="space-y-1">
              <span className="text-[0.6875rem] font-medium text-muted-foreground">
                Target URL
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <Input
                  readOnly
                  value={data.targetUrl}
                  className="min-w-0 flex-1 truncate font-mono text-xs"
                />
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={data.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open target URL"
                  >
                    <ExternalLink />
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[0.6875rem] font-medium text-muted-foreground">
                  Clicks
                </span>
                <div className="relative">
                  <MousePointerClick className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-primary" />
                  <Input
                    readOnly
                    value={data.clicks.toLocaleString()}
                    className="pl-7 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[0.6875rem] font-medium text-muted-foreground">
                  Created
                </span>
                <Input
                  readOnly
                  value={new Date(data.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
