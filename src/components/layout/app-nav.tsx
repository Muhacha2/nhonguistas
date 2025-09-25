'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Clapperboard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
    { href: '/feed', icon: Home },
    { href: '/explore', icon: Search },
    { href: '/create', icon: PlusSquare },
    { href: '/communities', icon: Clapperboard },
    { href: '/profile', icon: User },
];

export function AppNav() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const isAppPage = navItems.some(item => pathname.startsWith(item.href));

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up or at the top
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);


    if (!isAppPage) {
        return null;
    }

    return (
        <nav 
            id="main-nav" 
            className={cn(
                "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/30 border-t-2 border-border rounded-t-3xl shadow-2xl backdrop-blur-xl transition-transform duration-300 z-50",
                !isVisible && "translate-y-full"
            )}
        >
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link href={item.href} key={item.href}>
                        <div className={cn(
                            "nav-btn p-2 m-1 rounded-full bg-background hover:bg-primary/10 transition-colors duration-200 shadow-lg min-w-[48px] max-w-[80px] flex-1 flex items-center justify-center",
                            pathname === item.href && "bg-primary/20"
                        )}>
                            <item.icon className="w-7 h-7 text-foreground" />
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
