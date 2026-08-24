import type { Metadata } from "next";
import { InvitationAccept } from "@/components/invitations/InvitationAccept";

export const metadata: Metadata = {
  title: "Accept invitation",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <InvitationAccept token={token} />;
}
