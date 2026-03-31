import { useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { LogOutIcon, MenuIcon, XIcon, BarChart2Icon, UserIcon } from "lucide-react"
import { useAuthContext } from "../hooks/useAuthContext"
import { GitHub, Google } from "@/shared/ui/Icons"
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar"
import { Separator } from "@/shared/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetHeader,
} from "@/shared/ui/sheet"

const VITE_API_URL = import.meta.env.VITE_API_URL as string

export function AuthStatus() {
    const { user, isLoading, isAuthenticated } = useAuthContext()
    const queryClient = useQueryClient()
    const providerBadge = useMemo(
        () => (
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center bg-background border border-border size-3.5">
                {
                    {
                        google: <Google width={9} height={9} style={{ color: "var(--indigo)" }} />,
                        github: <GitHub width={9} height={9} style={{ color: "var(--indigo)" }} />,
                    }[user?.provider as string]
                }
            </span>
        ),
        [user?.provider]
    )

    async function handleLogout() {
        await fetch(`${VITE_API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        })
        queryClient.setQueryData(["auth", "me"], null)
    }

    if (isLoading) return null

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col sm:flex-row items-stretch border border-border">
                <span className="flex items-center justify-center px-3 py-1.5 text-xs text-muted-foreground tracking-widest uppercase">
                    sign in
                </span>

                <Separator className="sm:hidden" orientation="horizontal" />
                <Separator className="hidden sm:block" orientation="vertical" />

                <div className="flex items-stretch">
                    <a
                        href={`${VITE_API_URL}/auth/google`}
                        className="flex flex-1 items-center justify-center px-5 sm:px-3 py-3 sm:py-1.5 hover:bg-accent transition-colors"
                    >
                        <Google className="pointer-events-none" width={16} height={16} />
                    </a>

                    <Separator orientation="vertical" />

                    <a
                        href={`${VITE_API_URL}/auth/github`}
                        className="flex flex-1 items-center justify-center px-5 sm:px-3 py-3 sm:py-1.5 hover:bg-accent transition-colors"
                    >
                        <GitHub className="pointer-events-none" width={16} height={16} />
                    </a>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Mobile: Sheet */}
            <Sheet>
                <SheetTrigger asChild>
                    <button className="flex sm:hidden border border-border p-2.5 hover:bg-accent transition-colors cursor-pointer">
                        <MenuIcon size={16} className="text-muted-foreground" />
                    </button>
                </SheetTrigger>
                <SheetContent
                    side="top"
                    className="rounded-none p-0 gap-0"
                    showCloseButton={false}
                    aria-describedby={undefined}
                >
                    <SheetHeader className="px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <Avatar className="size-9">
                                    <AvatarImage
                                        src={user?.picture ?? undefined}
                                        alt={user?.name}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {user?.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {providerBadge}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <SheetTitle className="text-sm font-medium text-left leading-tight truncate">
                                    {user?.name}
                                </SheetTitle>
                                <span className="text-xs text-muted-foreground truncate">
                                    {user?.email}
                                </span>
                            </div>
                            <SheetClose className="border border-border p-2.5 hover:bg-accent transition-colors cursor-pointer shrink-0">
                                <XIcon size={16} className="text-muted-foreground" />
                                <span className="sr-only">Close</span>
                            </SheetClose>
                        </div>
                    </SheetHeader>
                    <nav className="flex border-t border-border">
                        <Link
                            to="/"
                            className="flex-1 flex items-center gap-2 px-5 py-3.5 text-xs tracking-widest uppercase border-r border-border hover:bg-accent transition-colors cursor-pointer"
                        >
                            <BarChart2Icon size={14} />
                            Market
                        </Link>
                        <Link
                            to="/profile"
                            className="flex-1 flex items-center gap-2 px-5 py-3.5 text-xs tracking-widest uppercase border-r border-border hover:bg-accent transition-colors cursor-pointer"
                        >
                            <UserIcon size={14} />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center gap-2 px-5 py-3.5 text-xs tracking-widest uppercase text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                        >
                            <LogOutIcon size={14} />
                            Sign out
                        </button>
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Desktop: full-width trigger → anchored dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger className="outline-none hidden sm:flex" asChild>
                    <div className="flex border border-border cursor-pointer hover:bg-accent/40 transition-colors">
                        <div className="flex items-center gap-3 px-3 py-1.5">
                            <div className="relative shrink-0">
                                <Avatar>
                                    <AvatarImage
                                        src={user?.picture ?? undefined}
                                        alt={user?.name}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {user?.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {providerBadge}
                            </div>
                            <span className="text-xs text-muted-foreground tracking-wide truncate max-w-36 capitalize">
                                {user?.name}
                            </span>
                        </div>
                        <Separator orientation="vertical" />
                        <span className="px-3 text-xs text-muted-foreground tracking-widest uppercase flex items-center">
                            menu
                        </span>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    sideOffset={0}
                    className="rounded-none shadow-none border-border border-t-0 w-(--radix-popper-anchor-width) p-0 bg-background"
                >
                    <DropdownMenuLabel className="flex flex-col gap-0.5 px-3 py-2.5">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                            {user?.email}
                        </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="mx-0 my-0" />
                    <DropdownMenuItem
                        asChild
                        className="rounded-none px-3 py-2.5 tracking-widest uppercase text-xs cursor-pointer"
                    >
                        <Link to="/" className="w-full cursor-pointer flex items-center gap-2">
                            <BarChart2Icon size={14} />
                            Market
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        asChild
                        className="rounded-none px-3 py-2.5 tracking-widest uppercase text-xs cursor-pointer"
                    >
                        <Link
                            to="/profile"
                            className="w-full cursor-pointer flex items-center gap-2"
                        >
                            <UserIcon size={14} />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-0 my-0" />
                    <DropdownMenuItem
                        variant="destructive"
                        className="rounded-none px-3 py-2.5 tracking-widest uppercase text-xs cursor-pointer"
                        onClick={handleLogout}
                    >
                        <LogOutIcon size={14} />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
