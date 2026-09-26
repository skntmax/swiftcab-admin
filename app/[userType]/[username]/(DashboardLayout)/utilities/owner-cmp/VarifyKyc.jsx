'use client'
import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert, Box, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useGetOwnerVhiclesListMutation } from '@app/libs/apis/owner';
import KycForm from './KYC';
import OwnerKycFormStatus from './OwnerKycFormStatus';
import { KYC_STATUS } from '@constants';
import InfoIcon from '@mui/icons-material/Info';

const kycChipColor = (status) => {
  if (status === KYC_STATUS.VERIFIED || status === KYC_STATUS.COMPLETED) return 'success';
  if (status === KYC_STATUS.INITIATED) return 'info';
  return 'warning';
};

function VarifyKyc() {
  const [getVehicles, { data: vehicles, isLoading: getVehiclesLoader }] = useGetOwnerVhiclesListMutation();

  React.useEffect(() => {
    getVehicles();
  }, []);

  const handleKycSubmission = () => {
    setTimeout(() => {
      getVehicles();
    }, 1000);
  };

  const list = Array.isArray(vehicles?.data) ? vehicles.data : [];

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Vehicle KYC
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Submit documents for pending vehicles, or review KYC that is already in progress or completed.
      </Typography>

      {getVehiclesLoader && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!getVehiclesLoader && list.length === 0 && (
        <Alert icon={<InfoIcon fontSize="inherit" />} severity="info">
          No vehicles to verify. Add a vehicle first.
        </Alert>
      )}

      <Box sx={{ maxWidth: 1100, width: '100%' }}>
        {list.map((vehicle, index) => (
          <Accordion
            key={vehicle.vhicle_id || vehicle.username || index}
            disableGutters
            sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                sx={{ width: '100%', pr: 2 }}
              >
                <Typography fontWeight={600}>
                  {vehicle.vhicle} · {vehicle.username || vehicle.vhicle_username}
                </Typography>
                <Chip
                  size="small"
                  label={vehicle.kyc_varification || 'PENDING'}
                  color={kycChipColor(vehicle.kyc_varification)}
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                {vehicle.kyc_varification === KYC_STATUS.PENDING && (
                  <KycForm fd={vehicle} kycStatus={vehicle.kyc_varification} formIndex={index} onRaiseKyc={handleKycSubmission} />
                )}
                {[KYC_STATUS.INITIATED, KYC_STATUS.VERIFIED, KYC_STATUS.COMPLETED].includes(vehicle.kyc_varification) && (
                  <OwnerKycFormStatus kycStatus={vehicle.kyc_varification} fd={[vehicle] || []} formIndex={index} />
                )}
              </Paper>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </>
  );
}

export default VarifyKyc;
