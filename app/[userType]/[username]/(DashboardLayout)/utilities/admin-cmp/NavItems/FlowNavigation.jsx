import React from "react";
import { motion } from "framer-motion";
import { IconCar, IconFileText, IconMap2, IconMapPin, IconDiscount2, IconWallet, IconCircleX, IconHelpCircle } from "lucide-react";

const iconMap = {
  IconCar: <IconCar size={24} />,
  IconFileText: <IconFileText size={24} />,
  IconMap2: <IconMap2 size={24} />,
  IconMapPin: <IconMapPin size={24} />,
  IconDiscount2: <IconDiscount2 size={24} />,
  IconWallet: <IconWallet size={24} />,
  IconCircleX: <IconCircleX size={24} />,
  IconHelpCircle: <IconHelpCircle size={24} />,
};

const FlowNavigation = ({ data }) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {data.map((item) => (
        <motion.div
          key={item.id}
          className="w-40 h-40 bg-white shadow-lg rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {item.icon && iconMap[item.icon]}
          <span className="text-lg font-semibold text-center">{item.nav_item}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default FlowNavigation;
