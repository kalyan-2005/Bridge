import { Skeleton } from "@/components/ui/skeleton";

export default function AnnouncementDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
