
'use client';

import { users as initialUsers } from "@/lib/data";
import Image from "next/image";
import { useState } from "react";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

    const handleFollow = (userId: string) => {
        setFollowingStatus(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const viewProfile = (username: string) => {
        router.push(`/profile/${username}`);
    }

    return (
        <main className="page active flex flex-col items-center justify-start p-4 pt-16 pb-24 h-full w-full">
            <div className="w-full max-w-3xl mx-auto">
                <header className="w-full mb-6">
                    <input 
                        id="search-bar" 
                        type="text" 
                        placeholder="Pesquisar pessoas ou publicações..." 
                        className="w-full p-3 h-12 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200" 
                    />
                </header>
                
                <h2 className="text-3xl font-bold mb-6 text-foreground text-left self-start">Explorar</h2>
                
                <div id="explore-profiles-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
                    {users.map((user, i) => {
                        const isFollowing = followingStatus[user.id];
                        return (
                            <div key={user.id} className='flex flex-col items-center'>
                                <div onClick={() => viewProfile(user.username)} className='relative w-24 h-24 rounded-full border-4 shadow-lg flex items-center justify-center mb-2 overflow-hidden cursor-pointer' style={{borderColor: `hsl(${i * 60}, 70%, 60%)`}}>
                                    <Image src={user.avatarUrl} alt={user.name} width={96} height={96} className='w-full h-full object-cover rounded-full'/>
                                </div>
                                <div className='text-sm font-semibold text-center mb-2 text-foreground'>{user.name}</div>
                                <button 
                                    onClick={() => handleFollow(user.id)}
                                    className={`px-4 py-1.5 rounded-full font-bold text-xs shadow transition text-white ${isFollowing ? 'bg-zinc-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                    {isFollowing ? 'Seguindo' : 'Seguir'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    );
}
