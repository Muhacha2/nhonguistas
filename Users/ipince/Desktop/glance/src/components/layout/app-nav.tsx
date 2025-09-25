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
                "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/30 border-t-2 border-border/50 rounded-t-3xl shadow-2xl backdrop-blur-xl transition-transform duration-300 z-50",
                !isVisible && "translate-y-full"
            )}
            style={{ perspective: '800px' }}
        >
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link href={item.href} key={item.href} className="flex-1 flex justify-center items-center h-full" style={{ WebkitTapHighlightColor: 'transparent' }}>
                            <div className={cn(
                                "nav-btn p-3 rounded-2xl bg-background/80 hover:bg-primary/10 transition-all duration-300 shadow-lg flex items-center justify-center transform-gpu",
                                isActive && "bg-primary/20 scale-110 shadow-[0_10px_20px_-10px_hsl(var(--primary)/0.5)] [box-shadow:0_4px_8px_rgba(0,0,0,0.3),_inset_0_2px_4px_rgba(255,255,255,0.05)]"
                            )}
                            style={{
                                transform: isActive ? 'translateY(-8px) rotateX(15deg) rotateY(0deg) scale(1.15)' : 'translateY(0) rotateX(0) rotateY(0) scale(1)',
                                transformStyle: 'preserve-3d',
                            }}
                            >
                                <item.icon className={cn("w-7 h-7 text-foreground transition-colors", isActive && "text-primary")} />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}
