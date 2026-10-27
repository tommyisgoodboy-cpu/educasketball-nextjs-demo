import type { Metadata } from "next";
import { CartView } from "@/components/shop/CartView";
import { Container } from "@/components/ui/Container";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "購物車", robots: { index: false } };

export default async function CartPage() {
  const user = await getUser();
  return (
    <Container className="py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold text-brand-800 sm:text-3xl">購物車</h1>
      <CartView loggedIn={Boolean(user)} />
    </Container>
  );
}
