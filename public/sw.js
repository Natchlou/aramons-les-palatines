self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { body: event.data?.text() ?? "" };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title ?? "Mon application",
      {
        body: data.body ?? "Tu as une nouvelle notification.",
        icon: "/icons/192.png",
        badge: "/icons/192.png",
        data: { url: data.url ?? "/" },
      },
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url ?? "/",
    self.location.origin,
  );

  if (target.origin !== self.location.origin) return;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then(async (windows) => {
      const existing = windows.find(
        (client) => "focus" in client,
      );

      if (existing) {
        await existing.navigate(target.href);
        return existing.focus();
      }

      return clients.openWindow(target.href);
    }),
  );
});
