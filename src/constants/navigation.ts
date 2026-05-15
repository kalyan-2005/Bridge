export type NavIconKey =
  | "layout-dashboard"
  | "megaphone"
  | "pen-square"
  | "user-round"
  | "bell"
  | "settings";

export type NavItem = {
  title: string;
  href: string;
  icon: NavIconKey;
};

export const USER_NAV: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: "layout-dashboard" },
  { title: "Announcements", href: "/dashboard/announcements", icon: "megaphone" },
  { title: "Profile", href: "/dashboard/profile", icon: "user-round" },
  { title: "Notifications", href: "/dashboard/notifications", icon: "bell" },
  { title: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export const AUTHOR_NAV_ITEM: NavItem = {
  title: "Author workspace",
  href: "/dashboard/author",
  icon: "pen-square",
};
