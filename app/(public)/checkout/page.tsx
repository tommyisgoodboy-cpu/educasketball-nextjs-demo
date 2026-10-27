import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { Container } from "@/components/ui/Container";
import { getProfile } from "@/lib/auth";
import { getMyPoints, getPointsRules } from "@/lib/data/account";

export const metadata: Metadata = { title: "結帳", robots: { index: false } };

export default async function CheckoutPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/checkout");
  const [{ balance }, rules] = await Promise.all([getMyPoints(), getPointsRules()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold text-brand-800 sm:text-3xl">結帳</h1>
      <CheckoutForm
        defaults={{ name: profile.full_name ?? "", phone: profile.phone ?? "" }}
        balance={balance}
        redeemPoints={rules.redeemPoints}
        redeemValue={rules.redeemValue}
      />
    </Container>
  );
}
