import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationsContext";
import { Home, User, Heart, Bell } from "lucide-react";
import { useEffect } from "react";

export function Root() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "admin" && !["/admin", "/notifications", "/profile"].includes(location.pathname)) {
      navigate("/admin");
    }
  }, [user, navigate, location.pathname]);

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";

  const navItems = isAdmin
    ? [
        { path: "/notifications", icon: Bell, label: "Notif", badge: unreadCount },
        { path: "/profile", icon: User, label: "Profil" },
      ]
    : [
        { path: "/home", icon: Home, label: "Beranda" },
        { path: "/favorites", icon: Heart, label: "Favorit", badge: null },
        { path: "/notifications", icon: Bell, label: "Notif", badge: unreadCount },
        { path: "/profile", icon: User, label: "Profil" },
      ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl z-50">
        <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-4'} h-20 px-1`}>
          {navItems.map(({ path, icon: Icon, label, badge }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="relative flex flex-col items-center justify-center gap-1 transition-all duration-300"
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                )}
                <div className={`relative p-2 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg scale-110"
                    : "bg-transparent"
                }`}>
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-gray-500"
                  }`} />
                  {badge !== null && badge !== undefined && badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {badge > 99 ? "99+" : badge}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-emerald-600" : "text-gray-500"
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}