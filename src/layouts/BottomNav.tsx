import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Compass, Wallet, User } from "lucide-react";
import { cva } from "class-variance-authority";

const navItem = cva(
  [
    "flex flex-col items-center justify-center gap-1",
    "py-2 px-3 rounded-xl transition-colors",
  ],
  {
    variants: {
      active: {
        true: "text-woorido",
        false: "text-content-tertiary",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

const navIcon = cva("w-6 h-6 transition-transform", {
  variants: {
    active: {
      true: "scale-110",
      false: "",
    },
  },
  defaultVariants: {
    active: false,
  },
});

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink to={to} className="flex-1">
      {({ isActive }) => (
        <div className={navItem({ active: isActive })}>
          <span className={navIcon({ active: isActive })}>{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </div>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  const { t } = useTranslation("nav");

  const items: NavItemProps[] = [
    { to: "/", icon: <Home />, label: t("home") },
    { to: "/explore", icon: <Compass />, label: t("explore") },
    { to: "/wallet", icon: <Wallet />, label: t("wallet") },
    { to: "/profile", icon: <User />, label: t("profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-1/95 backdrop-blur-lg border-t border-surface-border pb-safe">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}
