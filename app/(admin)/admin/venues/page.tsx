import { AdminPageHeader } from "@/components/admin/AdminPage";
import { AddVenue, VenueCard } from "@/components/admin/VenueEditor";
import { requireVenueManager } from "@/lib/admin";
import { getVenuesWithUsage } from "@/lib/data/admin";

export const metadata = { title: "場地" };

export default async function VenuesPage() {
  const staff = await requireVenueManager();
  const venues = await getVenuesWithUsage();

  return (
    <>
      <AdminPageHeader
        title="場地"
        description={
          staff.isAdmin
            ? "有班次用緊嘅場地唔可以刪除。其他帳戶要管理場地，可以喺「會員及積分」逐個開權限。"
            : "你有場地管理權限。有班次用緊嘅場地唔可以刪除。"
        }
      />
      <div className="space-y-3">
        {venues.map(({ classCount, activeClassCount, ...v }) => (
          <VenueCard key={v.id} venue={v} classCount={classCount} activeClassCount={activeClassCount} />
        ))}
        <AddVenue />
      </div>
    </>
  );
}
