import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface NotificationItem {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  message: string;
  event_type: string;
  read_at: string | null;
  created_at: string;
}

export function useNotifications(workspaceId: string | null, userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase && workspaceId && userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !workspaceId || !userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    void supabase
      .from('notifications')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) setError(queryError.message);
        else setNotifications((data ?? []) as NotificationItem[]);
        setIsLoading(false);
      });

    const channel = supabase
      .channel(`notifications:${workspaceId}:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const notification = payload.new as NotificationItem;
          if (notification.user_id === userId) {
            setNotifications((current) => [notification, ...current].slice(0, 50));
          }
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [workspaceId, userId]);

  const markRead = async (notificationId: string) => {
    if (!supabase || !userId) return;
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, read_at: readAt } : item));
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('id', notificationId)
      .eq('user_id', userId);
    if (updateError) setError(updateError.message);
  };

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read_at).length,
    isLoading,
    error,
    markRead,
  };
}
