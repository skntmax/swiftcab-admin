import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const VectorNav = ({ navItems }) => {
  return (
    <div className="relative flex flex-col gap-4 p-4">
      {navItems.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </div>
  );
};

const NavItem = ({ item }) => {
  const hasSubMenu = item.sub_menu;

  return (
    <div className="relative group">
      <motion.div
        className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-lg font-medium">{item.nav_item}</div>
        {hasSubMenu && <ChevronRight className="ml-auto" />}
      </motion.div>

      {hasSubMenu && item.sub_items && item.sub_items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-full top-0 ml-4 mt-2 space-y-2"
        >
          <SubMenu items={item.sub_items} />
        </motion.div>
      )}
    </div>
  );
};

const SubMenu = ({ items }) => {
  return (
    <div className="flex flex-col gap-2">
      {items.map((subItem) => (
        <motion.div
          key={subItem.id}
          className="p-2 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
          whileHover={{ x: 5 }}
        >
          {subItem.label}
        </motion.div>
      ))}
    </div>
  );
};

export default VectorNav;
