// Path: app/(protected)/notifications/page.tsx

import { Suspense } from 'react';
import { getCurrentUser, isAdmin } from '@/lib/security/auth-helpers';
import AdminNotificationControls from '@/components/notifications/AdminNotificationControls';
import { redirect } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { db } from '@/lib/db';

export const metadata = {
    title: 'Admin Notifications | Service Management',
    description: 'Administrative notification management',
};

// Define all possible user roles
const ALL_USER_ROLES = ['ADMIN', 'MANAGER', 'PROVIDER', 'USER', 'AGENT'];

export default async function AdminNotificationsPage() {
    const user = await getCurrentUser();
    const isAdminUser = await isAdmin();

    if (!user || !isAdminUser) {
        redirect('/auth/login');
    }

    // Fetch notification statistics (optional)
    const notificationStats = await db.notification.groupBy({
        by: ['type'],
        _count: {
            id: true
        }
    });

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Admin Notifications</h1>
            
            <div className="mb-8">
                <p className="text-muted-foreground">
                    Send notifications to users by role. Notifications will appear in users' notification centers and can be targeted by role.
                </p>
            </div>

            <Suspense fallback={<div className="flex justify-center my-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <AdminNotificationControls userRoles={ALL_USER_ROLES} />
            </Suspense>
            
            {notificationStats && notificationStats.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Notification Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {notificationStats.map((stat) => (
                            <div key={stat.type} className="bg-background border rounded-lg p-4 shadow-sm">
                                <div className="text-2xl font-bold">{stat._count.id}</div>
                                <div className="text-sm text-muted-foreground">{stat.type.replace(/_/g, ' ')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}