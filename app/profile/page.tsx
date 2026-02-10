import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "My Account | Carnaval Radio",
  description: "Manage your Carnaval Radio account",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <ProfileClient session={session} />;
}
