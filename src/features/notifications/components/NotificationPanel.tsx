import {
    Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCircle2, Package, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Notification } from '../types/notifications';
import { useNotifications } from '../hooks/use-notifications';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

interface Props {
    projectId?: number;
    children: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
    Package: <Package className="h-4 w-4" />,
    FileText: <FileText className="h-4 w-4" />,
    CheckCircle2: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    AlertCircle: <AlertCircle className="h-4 w-4 text-orange-600" />,
    Bell: <Bell className="h-4 w-4" />,
};

/**
 * NotificationPanel component for displaying a dropdown notification panel.
 *
 * Features:
 * - Fetches and displays notifications for a project or globally
 * - Marks individual notifications as read on click
 * - Marks all notifications as read with a button
 * - Navigates to the related entity when a notification is clicked
 * - Shows loading and empty states
 * - Displays notification icons based on severity and type
 *
 * @component
 * @param props - Component props
 * @param props.projectId - Optional project ID to filter notifications
 * @param props.children - Trigger element that opens the popover
 * @returns The rendered notification panel component
 */
export const NotificationPanel = ({ projectId, children }: Props) => {
    const navigate = useNavigate();
    const { data, isLoading } = useNotifications.list({ project_id: projectId });
    const { mutate: markAsRead, isPending: isMarking } = useNotifications.markAsRead();
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useNotifications.markAllAsRead();

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        if (!notification.entity_type || !notification.entity_id || !projectId) {
            return;
        }

        const routes: Record<string, string> = {
            material_request: `/dashboard/projects/${projectId}/procurement/${notification.entity_id}`,
            vendor_quote: `/dashboard/projects/${projectId}/procurement/vendor-quotes/${notification.entity_id}`,
            purchase_order: `/dashboard/projects/${projectId}/procurement/purchase-orders/${notification.entity_id}`,
        };

        const route = routes[notification.entity_type];

        if (!route) {
            return;
        }

        navigate(route);
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllAsRead(projectId);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {(data?.meta?.unread_count ?? 0) > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={handleMarkAllAsRead}
                            disabled={isMarkingAll}
                        >
                            {isMarkingAll ? '...' : 'Mark all read'}
                        </Button>
                    )}
                </div>

                <ScrollArea className="max-h-96">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                        </div>
                    ) : data?.data?.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {data?.data.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    disabled={isMarking}
                                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors disabled:opacity-50 ${
                                        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full shrink-0 ${
                                            notification.severity === 'success' ? 'bg-green-100 text-green-700' :
                                            notification.severity === 'warning' ? 'bg-orange-100 text-orange-700' :
                                            notification.severity === 'error' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {iconMap[notification.icon] || <Bell className="h-4 w-4" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-medium text-sm truncate">{notification.title}</p>
                                                {!notification.is_read && (
                                                    <Badge variant="outline" className="text-[10px] shrink-0 h-5 px-1.5">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-2">
                                                {formatDistanceToNow(new Date(`${notification.created_at}Z`), {
                                                    addSuffix: true,
                                                    locale: es
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {data?.data && data.data.length > 0 && (
                    <>
                        <Separator />
                        <Button
                            variant="ghost"
                            className="w-full justify-center text-xs h-9 text-primary"
                            onClick={() => {}}
                        >
                            View all notifications
                        </Button>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
};