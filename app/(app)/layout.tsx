import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/api/get-session";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (!profile || !profile.is_active) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar role={profile.role} displayName={profile.display_name} />
      <div className="flex flex-1 flex-col min-h-svh min-w-0">
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
