
import React from "react";
import { NavLink } from "react-router-dom";
import { Crown, HelpCircle } from "lucide-react";

interface NavbarLinksProps {
  isMobile?: boolean;
}

const NavbarLinks: React.FC<NavbarLinksProps> = ({ isMobile = false }) => {
  return (
    <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex items-center justify-center space-x-8'}`}>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${isActive ? "font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`
        }
      >
        Главная
      </NavLink>
      <NavLink
        to="/frontend"
        className={({ isActive }) =>
          `${isActive ? "font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`
        }
      >
        Frontend
      </NavLink>
      <NavLink
        to="/backend"
        className={({ isActive }) =>
          `${isActive ? "font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`
        }
      >
        Backend
      </NavLink>
      <NavLink
        to="/fullstack"
        className={({ isActive }) =>
          `${isActive ? "font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`
        }
      >
        Fullstack
      </NavLink>
      <NavLink
        to="/forum"
        className={({ isActive }) =>
          `${isActive ? "font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`
        }
      >
        Форум
      </NavLink>
      <NavLink
        to="/premium"
        className={({ isActive }) =>
          `${
            isActive 
              ? "font-medium text-amber-500" 
              : "text-muted-foreground"
          } hover:text-amber-500 transition-colors flex items-center gap-1`
        }
      >
        <Crown className="h-4 w-4" />
        Premium
      </NavLink>
      <NavLink
        to="/premium-help"
        className={({ isActive }) =>
          `${
            isActive 
              ? "font-medium text-blue-500" 
              : "text-muted-foreground"
          } hover:text-blue-500 transition-colors flex items-center gap-1`
        }
      >
        <HelpCircle className="h-4 w-4" />
        Премиум помощь
      </NavLink>
    </div>
  );
};

export default NavbarLinks;
