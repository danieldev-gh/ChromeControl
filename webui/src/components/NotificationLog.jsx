import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Bell, X } from "lucide-react";

const NotificationLog = forwardRef((props, ref) => {
  const [notifications, setNotifications] = useState([]);
  const [nextId, setNextId] = useState(0);

  useImperativeHandle(ref, () => ({
    addNotification: (text, icon = null) => {
      const newNotification = {
        id: nextId,
        text,
        icon,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [...prev, newNotification]);
      setNextId((prev) => prev + 1);
    },
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications((prev) =>
        prev.filter((notif) => now - notif.timestamp < 5000)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <div className="fixed top-10 right-4 flex flex-col-reverse gap-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 animate-fade-in"
          style={{
            animation: `
              fadeIn 0.3s ease-in-out,
              fadeOut 0.3s ease-in-out ${4.7}s forwards
            `,
          }}
        >
          {notification.icon ? (
            notification.icon
          ) : (
            <Bell className="w-5 h-5 text-blue-500" />
          )}
          <span className="flex-1">{notification.text}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }
        `}
      </style>
    </div>
  );
});

export default NotificationLog;
