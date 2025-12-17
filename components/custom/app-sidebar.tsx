"use client";

import { useSession } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { usePathname} from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuLayoutDashboard,
  LuFolderGit2,
  LuStar,
  LuCreditCard,
  LuSettings,
} from "react-icons/lu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  Github,
  LogOut,
  Moon,
  Sun,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import Logout from "@/module/auth/components/logout";

const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  if (!mounted || !session) return null;

  const user = session.user;
  const userName = user.name ?? "Guest";
  const userEmail = user.email ?? "";
  const userAvatar = user.image;

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const navigationItems = [
    { title: "Dashboard", url: "/dashboard", icon: LuLayoutDashboard },
    { title: "Repository", url: "/dashboard/repository", icon: LuFolderGit2 },
    { title: "Reviews", url: "/dashboard/reviews", icon: LuStar },
    { title: "Subscription", url: "/dashboard/subscription", icon: LuCreditCard },
    { title: "Settings", url: "/dashboard/settings", icon: LuSettings },
  ];


  const isActive = (url: string) =>
    pathname === url;

  return (
    <Sidebar className="border-r bg-background">
      {/* ───────────────── Header ───────────────── */}
      <SidebarHeader className="border-b px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Github className="h-5 w-5" />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">Connected Account</span>
            <span className="truncate text-xs text-muted-foreground">
              @{userName}
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ───────────────── Navigation ───────────────── */}
      <SidebarContent className="px-2 py-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>

        <SidebarMenu className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  data-active={active}
                  tooltip={item.title}
                  className="
                    group relative flex items-center gap-3 rounded-lg px-3 py-2
                    text-sm font-medium transition-all
                    text-muted-foreground
                    hover:bg-muted hover:text-foreground
                    data-[active=true]:bg-primary/10
                    data-[active=true]:text-primary
                  "
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-primary" />
                  )}

                  <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <a href={item.url} className="truncate">{item.title}</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ───────────────── Footer / User ───────────────── */}
      <SidebarFooter className="border-t px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="text-xs font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col text-left">
                    <span className="truncate text-sm font-medium">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </span>
                  </div>

                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56 rounded-xl p-1"
              >
                <DropdownMenuItem
                  onClick={() =>
                    setTheme(theme === "dark" ? "light" : "dark")
                  }
                  className="flex items-center gap-2 rounded-lg"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Light mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark mode</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <Logout>Sign out</Logout>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
