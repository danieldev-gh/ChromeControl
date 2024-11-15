import React from "react";
import ClientSelector from "./ClientSelector";
import StatsDisplaySmall from "./StatsDisplaySmall";
const Navbar = () => {
  const links = ["Home", "Monitor", "Actions", "Proxy", "Settings"];
  return (
    <nav className="bg-blue-900 p-2 px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex-shrink-0">
          <img className="w-12 h-12" src="/icon.png"></img>
        </div>
        <div className="flex justify-center ">
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={`/${link.toLowerCase()}`}
                className={`px-3 text-white text-lg font-medium ${
                  location.pathname === `/${link.toLowerCase()}`
                    ? "underline"
                    : ""
                }`}
              >
                {link}
              </a>
              {index !== links.length - 1 && (
                <span className="text-white mx-2">|</span>
              )}
            </div>
          ))}
        </div>
        <ClientSelector className="w-52 h-8" />
        <StatsDisplaySmall />
      </div>
    </nav>
  );
};

export default Navbar;
