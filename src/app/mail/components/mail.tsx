"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
  Menu,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AccountSwitcher } from "@/app/mail/components/account-switcher"
import { MailDisplay } from "@/app/mail/components/mail-display"
import { MailList } from "@/app/mail/components/mail-list"
import { Nav } from "@/app/mail/components/nav"
import { type Mail } from "@/app/mail/data"
import { useMail } from "@/app/mail/use-mail"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"

interface MailProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  mails: Mail[];
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

// Media Query hook to check mobile view size reactively
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}

export function Mail({
  accounts,
  mails,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail, setMail] = useMail()
  const isMobile = useIsMobile()
  const [isFolderSheetOpen, setIsFolderSheetOpen] = React.useState(false)

  const handleBack = React.useCallback(() => {
    setMail({ selected: null })
  }, [setMail])

  const foldersList = (
    <div className="flex flex-col h-full bg-background pt-2">
      <div className={cn("flex h-[52px] items-center justify-center", isCollapsed ? "h-[52px]" : "px-2")}>
        <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
      </div>
      <Separator className="mx-0" />
      <div className="m-3">
        <Button className="w-full cursor-pointer">
          {isCollapsed ? "" : "Compose"}
          <Send className="size-4" />
        </Button>
      </div>
      <Separator className="mx-0" />
      <div className="flex-grow overflow-y-auto">
        <Nav
          isCollapsed={isCollapsed}
          onClick={() => setIsFolderSheetOpen(false)}
          links={[
            { title: "Inbox", label: "128", icon: Inbox, variant: "default" },
            { title: "Drafts", label: "9", icon: File, variant: "ghost" },
            { title: "Sent", label: "", icon: Send, variant: "ghost" },
            { title: "Junk", label: "23", icon: ArchiveX, variant: "ghost" },
            { title: "Trash", label: "", icon: Trash2, variant: "ghost" },
            { title: "Archive", label: "", icon: Archive, variant: "ghost" },
          ]}
        />
        <Separator className="mx-0" />
        <Nav
          isCollapsed={isCollapsed}
          onClick={() => setIsFolderSheetOpen(false)}
          links={[
            { title: "Social", label: "972", icon: Users2, variant: "ghost" },
            { title: "Updates", label: "342", icon: AlertCircle, variant: "ghost" },
            { title: "Forums", label: "128", icon: MessagesSquare, variant: "ghost" },
            { title: "Shopping", label: "8", icon: ShoppingCart, variant: "ghost" },
            { title: "Promotions", label: "21", icon: Archive, variant: "ghost" },
          ]}
        />
      </div>
    </div>
  )

  const selectedMail = mails.find((item) => item.id === mail.selected) || null

  // MOBILE VIEW: Render single pane view (Stacked display)
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full flex-col border rounded-lg overflow-hidden bg-background">
          {selectedMail ? (
            <div className="flex-1 overflow-y-auto">
              <MailDisplay mail={selectedMail} onBack={handleBack} />
            </div>
          ) : (
            <Tabs defaultValue="all" className="flex flex-1 flex-col h-full">
              <div className="flex items-center px-4 py-2 border-b gap-2 bg-background shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFolderSheetOpen(true)}
                  className="cursor-pointer h-8 w-8"
                  title="Menu"
                >
                  <Menu className="size-4" />
                </Button>
                <h1 className="text-foreground text-lg font-bold">Inbox</h1>
                <TabsList className="ml-auto h-8">
                  <TabsTrigger value="all" className="cursor-pointer text-xs py-1 px-2.5">All mail</TabsTrigger>
                  <TabsTrigger value="unread" className="cursor-pointer text-xs py-1 px-2.5">Unread</TabsTrigger>
                </TabsList>
              </div>
              <Separator />
              <div className="p-3 bg-background border-b shrink-0">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
                  <Input placeholder="Search" className="pl-8 h-9" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                <TabsContent value="all" className="m-0 h-full">
                  <MailList items={mails} />
                </TabsContent>
                <TabsContent value="unread" className="m-0 h-full">
                  <MailList items={mails.filter((item) => !item.read)} />
                </TabsContent>
              </div>
            </Tabs>
          )}

          {/* Sidebar folder navigation sheet drawer on mobile */}
          <Sheet open={isFolderSheetOpen} onOpenChange={setIsFolderSheetOpen}>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col h-full">
              <div className="sr-only">
                <SheetTitle>Folder Navigation</SheetTitle>
                <SheetDescription>Browse your email categories and tags</SheetDescription>
              </div>
              {foldersList}
            </SheetContent>
          </Sheet>
        </div>
      </TooltipProvider>
    )
  }

  // DESKTOP VIEW: Render standard ResizableSplit panels
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`;
        }}
        className="h-full items-stretch rounded-lg border overflow-hidden bg-background"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
          }}
          onResize={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
          }}
          className={cn(isCollapsed && "w-full transition-all duration-300 ease-in-out")}
        >
          {foldersList}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all" className="gap-1 flex flex-col h-full">
            <div className="flex items-center px-4 py-1.5 shrink-0">
              <h1 className="text-foreground text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all" className="cursor-pointer">All mail</TabsTrigger>
                <TabsTrigger value="unread" className="cursor-pointer">Unread</TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 shrink-0">
              <form>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 size-4 cursor-pointer" />
                  <Input placeholder="Search" className="pl-8 cursor-text" />
                </div>
              </form>
            </div>
            <div className="flex-grow overflow-y-auto min-h-0">
              <TabsContent value="all" className="m-0">
                <MailList items={mails} />
              </TabsContent>
              <TabsContent value="unread" className="m-0">
                <MailList items={mails.filter((item) => !item.read)} />
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <MailDisplay mail={selectedMail} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
