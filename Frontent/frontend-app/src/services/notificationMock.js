// Client-side mock notification service (useful for dev/demo)
let notifications = [
  { id: 1, title: 'Colis #123 en retard', body: 'Le colis #123 est en retard depuis 2h', unread: true, created_at: Date.now() - 60000 },
  { id: 2, title: 'Nouveau message client', body: "Client a ajouté une remarque sur la livraison #98", unread: true, created_at: Date.now() - 120000 },
];

export const getUnreadCount = async () => {
  await new Promise(r => setTimeout(r, 120));
  return notifications.filter(n => n.unread).length;
};

export const getNotifications = async () => {
  await new Promise(r => setTimeout(r, 120));
  return [...notifications].sort((a,b) => b.created_at - a.created_at);
};

export const markAllRead = async () => {
  await new Promise(r => setTimeout(r, 120));
  notifications = notifications.map(n => ({ ...n, unread: false }));
  return true;
};

export const pushMockNotification = (notif) => {
  notifications.unshift({ id: Date.now(), ...notif, unread: true, created_at: Date.now() });
};
