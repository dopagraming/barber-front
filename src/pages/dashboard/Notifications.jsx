import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Bell } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
    };
    fetchNotifications();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
        <Bell className="w-5 h-5" /> الإشعارات
      </h2>
      <ul className="space-y-4">
        {notifications.map((notif) => (
          <li key={notif._id} className="bg-dark-700 p-4 rounded shadow">
            <p className="font-semibold text-white">{notif.title}</p>
            <p className="text-md text-gray-300">{notif.body}</p>
            <span className=" text-gray-500">
              {new Date(notif.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
