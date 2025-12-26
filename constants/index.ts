export const manufacturers = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Citroen",
  "Dodge",
  "Ferrari",
  "Fiat",
  "Ford",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "MINI",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Ram",
  "Rolls-Royce",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

export const yearsOfProduction = [
  { title: "Year", value: "" },
  { title: "2015", value: "2015" },
  { title: "2016", value: "2016" },
  { title: "2017", value: "2017" },
  { title: "2018", value: "2018" },
  { title: "2019", value: "2019" },
  { title: "2020", value: "2020" },
  { title: "2021", value: "2021" },
  { title: "2022", value: "2022" },
  { title: "2023", value: "2023" },
];

export const fuels = [
  {
    title: "Fuel",
    value: "",
  },
  {
    title: "Gas",
    value: "Gas",
  },
  {
    title: "Electricity",
    value: "Electricity",
  },
];

export const footerLinks = [
  {
    title: "About",
    links: [
      { title: "How it works", url: "/" },
      { title: "Featured", url: "/" },
      { title: "Partnership", url: "/" },
      { title: "Bussiness Relation", url: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "Events", url: "/" },
      { title: "Blog", url: "/" },
      { title: "Podcast", url: "/" },
      { title: "Invite a friend", url: "/" },
    ],
  },
  {
    title: "Socials",
    links: [
      { title: "LinkedIn", url: "https://www.linkedin.com/in/sayed-tabish/" },
      { title: "Twitter", url: "https://twitter.com/sayedtabish72" },
      { title: "GitHub", url: "https://github.com/SayedTabish72" },
      { title: "Portfolio", url: "https://sayedtabish.netlify.app/" },
    ],
  },
];


export const SWC_KEYS = {
  SWC_TOKEN:"SWC_TOKEN",
  SWC_USER:"SWC_USER"
}

  export const  KYC_STATUS= {
    INITIATED:"INITIATED",
    PENDING:'PENDING',
    VERIFIED:"VERIFIED",
    COMPLETED:"COMPLETED"
  }

export const KYC_STATUS_ARRAY = Object.entries(KYC_STATUS).map(([key,value])=> ({ label:key , value:value }))

export const USER_ROLES = {
  superAdmin: "super-admin",
  admin: "admin",
  salesManager: "sales-manager",
  salesExecutive: "sales-executive",
  salesRepresentative: "sales-representative",
  accountManager: "account-manager",
  marketingManager: "marketing-manager",
  marketingExecutive: "marketing-executive",
  marketingSpecialist: "marketing-specialist",
  customerSupportManager: "customer support-manager",
  supportAgent: "support-agent",
  helpdeskAgent: "helpdesk-agent",
  technicalSupportEngineer: "technical support-engineer",
  operationsManager: "operations-manager",
  financeManager: "finance-manager",
  crmDeveloper: "crm-developer",
  crmAnalyst: "crm-analyst",
  partnerManager: "partner-manager",
  vendorCoordinator: "vendor-coordinator",
  customer: "customer",
  owner: "owner",
  ['driver-partner']:"driver-partner"
};


export const SOCKET_EVENTS = {
  SEARCH_CUSTOMER :"SEARCH_CUSTOMER" ,
  EV_DRIVER_LIVE_LOCATION:"EV_DRIVER_LIVE_LOCATION",
  EV_DRIVER_LOGGED_OUT:"EV_DRIVER_LOGGED_OUT",
  NEW_RIDE_REQUEST:"NEW_RIDE_REQUEST",
  DRIVER_ACCEPTED_THE_RIDE:"DRIVER_ACCEPTED_THE_RIDE",
  OTP_VARIFICATION:"OTP_VARIFICATION",
  RIDE_ALREADY_TAKEN:"RIDE_ALREADY_TAKEN",
  CAB_BOOK:"CAB_BOOK",
  CAB_BOOKED:"CAB_BOOKED",
  RIDE_INTIATED_BY_DRIVER:"RIDE_INTIATED_BY_DRIVER",
  INVALID_RIDE_OTP:"INVALID_RIDE_OTP",
  RIDE_STARTED:"RIDE_STARTED",
  // on validatione error
  UNAUTHORIZED:"UNAUTHORIZED",
  CUSTOMER_CANCELLED_RIDE:"CUSTOMER_CANCELLED_RIDE",
  PAY_BY_CUSTOMER:"PAY_BY_CUSTOMER",

};

