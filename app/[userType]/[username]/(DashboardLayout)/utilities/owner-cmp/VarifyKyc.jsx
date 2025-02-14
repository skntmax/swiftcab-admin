import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { useGetOwnerVhiclesListMutation } from '@app/libs/apis/owner';
import KycForm from './KYC'
import Chip from '@mui/material/Chip';
function VarifyKyc() {

 const [getVehicles, { data, isLoading, error }] = useGetOwnerVhiclesListMutation(); 
 
   React.useEffect(() => {
     getVehicles(); 
 
   }, []);

   const vehicles = data?.data || [];

  return (
   <>

      {vehicles && vehicles.length==0 &&<> No vhicles </> } 
      {vehicles.map((vehicle, index) => (
        <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          
          <Typography component="span">  
          <Chip label={`${vehicle.vhicle} - vehicle No.(${vehicle.username})  `} />
          Kyc Status: <span style={{ textAlign: "center", fontWeight: "bold", color: vehicle.is_kyc?"green":"red" , mb: 2 }} >  {vehicle.is_kyc?"Completed":"Pending"} </span>
           </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <KycForm fd={vehicle} formIndex = {index} />
        </AccordionDetails>
      </Accordion>
      ))}


   </>
  )
}

export default VarifyKyc