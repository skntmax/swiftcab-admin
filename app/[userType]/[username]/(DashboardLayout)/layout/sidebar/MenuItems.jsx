import {
  Car,
  ClipboardList,
  Gauge,
  HardHat,
  Heart,
  Route,
  Search,
  Smile,
  UserPlus,
} from "lucide-react";

import { uniqueId } from "lodash";

const Menuitems = [

   {
    navlabel: true,
    subheader: "Vhicles",
  },

  {
    id: uniqueId(),
    title: "Add Vhicles",
    icon: Car,
    href: "/add-vhicles",
  },

  {
    id: uniqueId(),
    title: "Registered Vhicles",
    icon: ClipboardList,
    href: "/registered-vhicles",
  },

  {
    id: uniqueId(),
    title: "Add vhicle services",
    icon: Search,
    href: "/add-vhicles-services",
  },

  {
    id: uniqueId(),
    title: "Vhicles occupied services",
    icon: Heart,
    href: "/vhicles-services",
  },

  {
    id: uniqueId(),
    title: "KYC update",
    icon: Car,
    href: "/kyc-update",
  },

  {
    navlabel: true,
    subheader: "Rides",
  },
  
  {
    id: uniqueId(),
    title: "Today rides",
    icon: Route,
    href: "/today-rides",
  },
  
  {
    id: uniqueId(),
    title: "All Rides",
    icon: Route,
    href: "/all-rides",
  },

  {
    navlabel: true,
    subheader: "Master",
  },
  {
    id: uniqueId(),
    title: "All Vhicles",
    icon: HardHat,
    href: "/all-vhicles",
  },

  {
    id: uniqueId(),
    title: "Roles",
    icon: UserPlus,
    href: "/roles",
  },

  {
    navlabel: true,
    subheader: "Settlements",
  },
  {
    id: uniqueId(), 
    title: "Active Month",
    icon: Smile,
    href: "/active-month-settlement",
  },
  {
    id: uniqueId(),
    title: "Any Month",
    icon: Gauge,
    href: "/any-month-settlement",
  },
];

export default Menuitems;
