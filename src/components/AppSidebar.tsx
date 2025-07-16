import { useAuth } from "@/hooks/useAuth";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  ClipboardList,
} from "lucide-react";

const navigationItems = {
  admin: [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Students", url: "/students", icon: Users },
    { title: "Classes", url: "/classes", icon: GraduationCap },
    { title: "Subjects", url: "/subjects", icon: BookOpen },
    { title: "Exams", url: "/exams", icon: FileText },
    { title: "Results", url: "/results", icon: ClipboardList },
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  teacher: [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "My Exams", url: "/exams", icon: FileText },
    { title: "Enter Results", url: "/results", icon: ClipboardList },
    { title: "Students", url: "/students", icon: Users },
    { title: "Reports", url: "/reports", icon: BarChart3 },
  ],
  student: [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "My Results", url: "/results", icon: ClipboardList },
    { title: "Exams", url: "/exams", icon: FileText },
  ],
};

export function AppSidebar() {
  const { profile } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  
  if (!profile) return null;
  
  const items = navigationItems[profile.role] || [];
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}