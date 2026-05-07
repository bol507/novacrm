import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const initEcho = (userId: number, projectId?: number) => {
  const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'local',
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/api/broadcasting/auth', // Endpoint de autenticación de canales privados
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    },
  });

  // Suscribirse a canales globales del usuario
  echo.private(`user.${userId}`)
    .listen('.material.request.submitted', (e: any) => {
      console.log('🔔 Nueva solicitud creada:', e);
      // dispatch(notify({ title: 'Nueva solicitud', message: e.message }));
    })
    .listen('.material.request.approved', (e: any) => {
      console.log('🔔 Solicitud actualizada:', e);
    });

  // Suscribirse a canal del proyecto (si se proporciona)
  if (projectId) {
    echo.private(`project.${projectId}`)
      .listen('.material.request.submitted', (e: any) => {
        console.log(`🔔 Proyecto ${projectId}: nueva solicitud`);
      })
      .listen('.purchase.order.created', (e: any) => {
        console.log(`🔔 Proyecto ${projectId}: nueva OC ${e.po_number}`);
        // queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-orders', projectId] });
      });
  }

  return echo;
};