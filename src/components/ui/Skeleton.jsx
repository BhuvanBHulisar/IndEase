import React from 'react';

export function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="space-y-3">
            {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonMachineCard() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-32 rounded-xl mt-4" />
        </div>
    );
}
