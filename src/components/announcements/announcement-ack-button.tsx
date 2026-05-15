"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acknowledgeAnnouncement } from "@/actions/announcement-actions";

export function AnnouncementAcknowledgeButton({ announcementId }: { announcementId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        start(async () => {
          const res = await acknowledgeAnnouncement({ announcementId });
          if (!res.success) {
            toast.error(res.error);
            return;
          }
          toast.success("Acknowledgment recorded");
          router.refresh();
        });
      }}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Acknowledge
    </Button>
  );
}
