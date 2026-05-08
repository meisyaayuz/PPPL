import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Landing } from "./components/pages/Landing";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Home } from "./components/pages/Home";
import { Map } from "./components/pages/Map";
import { Search } from "./components/pages/Search";
import { DestinationDetail } from "./components/pages/DestinationDetail";
import { Profile } from "./components/pages/Profile";
import { Favorites } from "./components/pages/Favorites";
import { Notifications } from "./components/pages/Notifications";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminAddDestination } from "./components/admin/AdminAddDestination";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  // Public routes - no login required
  { path: "/map", Component: Map },
  { path: "/search", Component: Search },
  { path: "/destination/:id", Component: DestinationDetail },
  {
    Component: Root,
    children: [
      { path: "/home", Component: Home },
      { path: "/favorites", Component: Favorites },
      { path: "/notifications", Component: Notifications },
      { path: "/profile", Component: Profile },
      { path: "/admin", Component: AdminDashboard },
      { path: "/admin/add-destination", Component: AdminAddDestination },
      { path: "*", Component: NotFound },
    ],
  },
]);