import { SWC_KEYS } from "@constants";
import { getCookie } from "@node_modules/cookies-next/lib";
import { CarProps, FilterProps } from "@types";

export const calculateCarRent = (city_mpg: number, year: number) => {
  const basePricePerDay = 50; // Base rental price per day in dollars
  const mileageFactor = 0.1; // Additional rate per mile driven
  const ageFactor = 0.05; // Additional rate per year of vehicle age

  // Calculate additional rate based on mileage and age
  const mileageRate = city_mpg * mileageFactor;
  const ageRate = (new Date().getFullYear() - year) * ageFactor;

  // Calculate total rental rate per day
  const rentalRatePerDay = basePricePerDay + mileageRate + ageRate;

  return rentalRatePerDay.toFixed(0);
};

export const updateSearchParams = (type: string, value: string) => {
  // Get the current URL search params
  const searchParams = new URLSearchParams(window.location.search);

  // Set the specified search parameter to the given value
  searchParams.set(type, value);

  // Set the specified search parameter to the given value
  const newPathname = `${window.location.pathname}?${searchParams.toString()}`;

  return newPathname;
};

export const deleteSearchParams = (type: string) => {
  // Set the specified search parameter to the given value
  const newSearchParams = new URLSearchParams(window.location.search);

  // Delete the specified search parameter
  newSearchParams.delete(type.toLocaleLowerCase());

  // Construct the updated URL pathname with the deleted search parameter
  const newPathname = `${window.location.pathname}?${newSearchParams.toString()}`;

  return newPathname;
};

export async function fetchCars(filters: FilterProps) {
  const { manufacturer, year, model, limit, fuel } = filters;

  // Set the required headers for the API request
  const headers: HeadersInit = {
    'X-RapidAPI-Key': '279d8cd97dmsh399d0a6b97f99e8p1fa76fjsn7f2bed151a34',
    'X-RapidAPI-Host': 'cars-by-api-ninjas.p.rapidapi.com'
  };

  // Set the required headers for the API request
  const response = await fetch(
    `https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?make=${manufacturer}&year=${year}&model=${model}&limit=${limit}&fuel_type=${fuel}`,
    {
      headers: headers,
    }
  );

  // Parse the response as JSON
  const result = await response.json();

  return result;
}

export const generateCarImageUrl = (car: CarProps, angle?: string) => {
  const url = new URL("https://cdn.imagin.studio/getimage");
  const { make, model, year } = car;

  url.searchParams.append('customer', process.env.NEXT_PUBLIC_IMAGIN_API_KEY || '');
  url.searchParams.append('make', make);
  url.searchParams.append('modelFamily', model.split(" ")[0]);
  url.searchParams.append('zoomType', 'fullscreen');
  url.searchParams.append('modelYear', `${year}`);
  // url.searchParams.append('zoomLevel', zoomLevel);
  url.searchParams.append('angle', `${angle}`);

  return `${url}`;
} 


export const generateUsername = (name:string) => {
  if (!name) return "User" + Math.floor(1000 + Math.random() * 9000);

  const randomWords = ["_xpert", "_pro", "_master", "_legend", "_hero", "_ace", "_nlite", "_nova"];
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];

  return `${name}${randomWord}${randomSuffix}`;
};




export const getUserInfo = () => {
  
  let user:any  = getCookie(SWC_KEYS.SWC_USER)
  if(!user) return {}

  return JSON.parse(decodeURIComponent(user)) 
};

export function capitalizeFirstLetter(string:string) {
  return string.replace(/^./, string[0].toUpperCase())
} 




