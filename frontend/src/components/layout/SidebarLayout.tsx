import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, Calendar, Settings, Menu, X } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../ui/sidebar';
import { Sheet, SheetContent } from '../ui/sheet';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Home, label: 'Rooms', path: '/rooms' },
    { icon: Calendar, label: 'Book', path: '/book' },
    { icon: Settings, label: 'Bookings', path: '/admin' },
  ];

  const SidebarContentComponent = () => (
    <>
      <SidebarHeader className="h-16 px-4 border-b">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm">
            <span className="text-base font-bold">C</span>
          </div>
          <span className="text-lg font-bold truncate text-foreground">CraftMyPlate</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={isActive} className="w-full">
                  <Link to={item.path} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 border-2 border-border">
            <AvatarFallback className="text-xs bg-muted">U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate text-foreground">User</span>
            <span className="text-xs text-muted-foreground truncate">user@example.com</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex shrink-0">
        <Sidebar className="w-56">
          <SidebarContentComponent />
        </Sidebar>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="bg-background"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-bold">C</span>
                </div>
                <span className="text-xl font-bold">CraftMyPlate</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContentComponent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;

