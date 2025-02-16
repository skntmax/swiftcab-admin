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
import { Box, CircularProgress } from '@node_modules/@mui/material';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import ContentLoader from  './../../../../../../components/loader/ContentLoader'
import { KYC_STATUS } from '@constants';

function VarifyKyc() {

 const [getVehicles, { data:vehicles, isLoading:getVehiclesLoader, error }] = useGetOwnerVhiclesListMutation(); 
 
   React.useEffect(() => {
     getVehicles(); 
   }, []);

  return (
   <>
   
       {!getVehiclesLoader && Array.isArray(vehicles?.data) &&  vehicles?.data?.length==0 &&   <Alert icon={<InfoIcon fontSize="inherit"  />} severity="error"> No any vhicle found </Alert> }
        { getVehiclesLoader && <ContentLoader /> }

        {
        getVehiclesLoader &&  <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "10px",
            width:"10px",
            height:"10px"
          }}
        >
          <CircularProgress />
        </Box>
        
    }


      { vehicles?.data && Array.isArray(vehicles?.data) &&  vehicles?.data?.length>0 && vehicles?.data?.map((vehicle, index) => (
        <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
        
         
          <Typography component="span">  
          <Chip label={`${vehicle.vhicle} - vehicle No.(${vehicle.username})  `} />
          Kyc Status: <span style={{ textAlign: "center", fontWeight: "bold",
           
           color: 
           vehicle.kyc_varification==KYC_STATUS.VERIFIED?"green" :
           vehicle.kyc_varification==KYC_STATUS.PENDING?"red" :
           vehicle.kyc_varification==KYC_STATUS.INITIATED?"yellow":""
           
           ,mb: 2
          }} >
          
          {vehicle?.kyc_varification} </span>
            
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <KycForm fd={vehicle} formIndex = {index} onRaiseKyc ={(fd)=> {
              console.log(fd) 
              getVehicles()
            }} />
          </AccordionDetails>
        </Accordion>
      ))  }
   </>
  )
}

export default VarifyKyc