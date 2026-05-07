import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/use-notifications';


interface Props {
  projectId?: number;
  onClick: () => void;
}

export const NotificationBell = ({ projectId, onClick }: Props) => {
  const {  data } = useNotifications.list({ 
    project_id: projectId, 
    unread_only: true 
  });

  const unreadCount = data?.meta?.unread_count ?? 0;

  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};