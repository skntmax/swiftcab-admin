import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconCar,
  IconReservedLine,
  IconDeviceImacSearch,
  IconDevicesHeart,
  IconCaravan,
  IconRoad,
  IconBrandStrava,
  IconHelmet
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [

   {
    navlabel: true,
    subheader: "Vhicles",
  },

  {
    id: uniqueId(),
    title: "Add Vhicles",
    icon: IconCar,
    href: "/add-vhicles",
  },

  {
    id: uniqueId(),
    title: "Registered Vhicles",
    icon: IconReservedLine,
    href: "/registered-vhicles",
  },

  {
    id: uniqueId(),
    title: "Add vhicle services",
    icon: IconDeviceImacSearch,
    href: "/add-vhicles-services",
  },

  {
    id: uniqueId(),
    title: "Vhicles occupied services",
    icon: IconDevicesHeart,
    href: "/vhicles-services",
  },

  {
    id: uniqueId(),
    title: "KYC update",
    icon: IconCaravan,
    href: "/kyc-update",
  },

  {
    navlabel: true,
    subheader: "Rides",
  },
  
  {
    id: uniqueId(),
    title: "Today rides",
    icon: IconRoad,
    href: "/today-rides",
  },
  
  {
    id: uniqueId(),
    title: "All Rides",
    icon: IconBrandStrava,
    href: "/all-rides",
  },

  {
    navlabel: true,
    subheader: "Master",
  },
  {
    id: uniqueId(),
    title: "All Vhicles",
    icon: IconHelmet,
    href: "/all-vhicles",
  },

  {
    id: uniqueId(),
    title: "Roles",
    icon: IconUserPlus,
    href: "/roles",
  },

  {
    navlabel: true,
    subheader: "Settlements",
  },
  {
    id: uniqueId(), 
    title: "Active Month",
    icon: IconMoodHappy,
    href: "/active-month-settlement",
  },
  {
    id: uniqueId(),
    title: "Any Month",
    icon: IconAperture,
    href: "/any-month-settlement",
  },
];

export default Menuitems;
