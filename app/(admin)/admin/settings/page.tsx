import { AdminPageHeader } from "@/components/admin/AdminPage";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/admin";
import { getAllSettings } from "@/lib/data/admin-shop";

export const metadata = { title: "網站設定" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getAllSettings();
  return (
    <>
      <AdminPageHeader title="網站設定" description="聯絡電話、WhatsApp、FPS 收款資料同積分規則。" />
      <SettingsForm settings={settings} />
    </>
  );
}
