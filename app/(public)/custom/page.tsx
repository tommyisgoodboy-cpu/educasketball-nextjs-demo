import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomRequestForm } from "@/components/shop/CustomRequestForm";
import { Container } from "@/components/ui/Container";
import { getProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "團體訂製", description: "球隊、學校同機構訂製球衣、熱身衣，填表即報價。" };

export default async function CustomPage() {
  const profile = await getProfile();
  return (
    <>
      <PageHeader
        eyebrow="團體訂製"
        title="球隊球衣、熱身衣訂製"
        description="話我哋知數量、尺碼同設計，我哋會喺 2 個工作天內報價。會員可以喺會員區睇報價同製作進度。"
      />
      <Container className="max-w-3xl py-10">
        <CustomRequestForm
          userId={profile?.id ?? null}
          defaults={{ name: profile?.full_name ?? "", phone: profile?.phone ?? "", email: profile?.email ?? "" }}
        />
      </Container>
    </>
  );
}
