import { Skeleton } from "@/components/ui/skeleton";

export default function AnnouncementsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
