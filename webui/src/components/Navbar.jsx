import React from "react";
import ClientSelector from "./ClientSelector";
import StatsDisplaySmall from "./StatsDisplaySmall";

const Navbar = () => {
  const links = ["Home", "Monitor", "Actions", "Proxy", "Settings"];
  const isCurrentPath = (path) =>
    location.pathname === `/${path.toLowerCase()}`;

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16 justify-between">
        <div className="flex items-center gap-8">
          <img className="w-10 h-10" src="/icon.png" alt="Logo" />

          <div className="flex items-center space-x-1">
            {links.map((link, index) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    isCurrentPath(link)
                      ? "text-white bg-blue-700/50"
                      : "text-blue-100 hover:text-white hover:bg-blue-700/30"
                  }`}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ClientSelector className="w-52" />
          <StatsDisplaySmall />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
