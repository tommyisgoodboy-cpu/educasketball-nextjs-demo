import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

export function AuthCard({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Container className="flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardBody className="space-y-6 sm:p-8">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold text-brand-800">{title}</h1>
              {description && <p className="text-sm text-ink-muted">{description}</p>}
            </div>
            {children}
          </CardBody>
        </Card>
        {footer && <div className="text-center text-sm text-ink-muted">{footer}</div>}
      </div>
    </Container>
  );
}

export function FormAlert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          : "rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800"
      }
    >
      {children}
    </div>
  );
}
