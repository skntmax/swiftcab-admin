'use client'
import { fetchCars } from "@utils";
import { HomeProps } from "@types";
import { fuels, yearsOfProduction } from "@constants";
import Login from './Login'
import { Provider } from "@node_modules/react-redux/dist/react-redux";
import {reduxStore} from './libs/store'
export default async function Home() { 
  return (
   <>
      <Provider store={reduxStore}>
          <Login/>
      </Provider>     
   </>
  );
}
