import React, { useContext, useEffect } from 'react';
import {
  Avatar,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  AccountCircle,
  AttachMoney,
  CheckCircle,
  Cancel,
  DocumentScanner,
  AccountBalance,
  CreditCard,
  Person
} from '@mui/icons-material';
import { FormInput } from '@components/FormController';
import { KYC_STATUS_ARRAY } from '@constants';
import { useForm } from "react-hook-form";
import { getStatusProps } from '@utils';
import { useApproveDriverKycMutation } from '@app/libs/apis/admin';
import { contextProvider } from '@components/AppProvider';



function AMSViewDriver({ data, formIndex,kycUpdated }) {
   const { successMessage, errorMessage } = useContext(contextProvider);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      approval_status: "",
    },
  });
  
  const onSubmit = (fs) => {
    // handle submission
    const { approval_status}  =  fs 
     if(approval_status) {
       getDriverDetails({
         "driverId":data?.driver ,
         "comment":"sample comment", 
         "status": approval_status
        })
      }
  };
  
  
  // api calling 
  const [getDriverDetails , {data:getDriverDetailsData  , isLoading:getDriverDetailsLoader }] = useApproveDriverKycMutation()
  

  // when api is called 
  useEffect(()=>{
    if(getDriverDetailsData?.status==500 && getDriverDetailsData?.error) return errorMessage(getDriverDetailsData?.message)
    if(getDriverDetailsData?.status==200 && !getDriverDetailsData?.error ) {
        successMessage(getDriverDetailsData?.message) 
        reset(); // reset all the states 
        kycUpdated()
      }
    }
    
  ,[getDriverDetailsData?.data])


  
  // default value for kys status of driver
  useEffect(()=>{
     reset({
      approval_status: data?.is_varified || "",
    });
    
  },[data?.is_varified])

  const hasData = data && (
    data.DL || data.RC || data.insurance || data.adhar_card ||
    data.pan_card || data.profile_pic
  );

  if (!hasData) {
    return (
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Avatar sx={{ bgcolor: 'warning.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
          <Cancel fontSize="medium" />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No Driver Data Found
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please update driver details to start taking rides.
        </Typography>
      </Paper>
    );
  }


   
  const { label, color } = getStatusProps(data?.is_varified);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
          <Avatar
            src={data.profile_pic || ''}
            alt="Driver Profile"
            sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {data?.driver_profile_id?.username || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            {data?.driver_profile_id?.email || 'N/A'}
          </Typography>
        </Grid>


              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Vehicle:{" "}
                          <Typography component="span" sx={{ fontWeight: 400 }}>
                            {data?.vhicleDetails?.vehicle_id || "No Vhicle Assigned"}{" "}
                            - {data?.vhicleDetails?.vhicle_type? String(data?.vhicleDetails?.vhicle_type)?.toUpperCase() :  "N/A"}
                          </Typography>
                        </Typography>
            
                        <Typography variant="body1" sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}>
                          Plate No:{" "}
                          <Typography component="span" sx={{ fontWeight: 400 }}>
                            {data?.vhicleDetails?.vehicle_number || "N/A"}
                          </Typography>
                        </Typography>
            
                        <Typography variant="body1" sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}>
                          Color:{"  "}
                          <Typography component="span" sx={{ fontWeight: 400 }}>
                            { data?.vhicleDetails?.vh_color ?String(data?.vhicleDetails?.vh_color)?.toUpperCase() : "N/A"}
                          </Typography>
                        </Typography>
            
                        <Typography variant="body1" sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}>
                          Owner:
                          <Person fontSize="small" sx={{ mx: 1 }} />
                          <Typography component="span" sx={{ fontWeight: 400 }}>
                            {data?.vhicleDetails?.username || "N/A"}
                          </Typography>
                        </Typography>
                      </Box>


        {/* Right Content */}
        <Grid item xs={12} md={9}>
          <CompactCard title="Driver Documents" icon={<DocumentScanner />}>
            <Doc label="DL" url={data.DL} />
            <Doc label="RC" url={data.RC} />
            <Doc label="Insurance" url={data.insurance} />
            <Doc label="PAN" url={data.pan_card} />
            <Doc label="Aadhar" url={data.adhar_card} />
            <Doc label="Passbook" url={data.passbook} />
          </CompactCard>

          <CompactCard title="Wallet & Verification" icon={<AttachMoney />}>
            <Info label="Wallet Code" value={data.wallet_code} />
            <Info label="Balance" value={`₹${data.wallet_balance}`} />
            <Status label="Bank Verified" status={data.is_bank_varified} />
            <StatusBadge label={`KYC ${label}`} color={color} />
            <Info label="Created On" value={new Date(data.created_on).toLocaleString()} />
            <Info label="Updated On" value={new Date(data.updated_on).toLocaleString()} />
          </CompactCard>

          <CompactCard title="Bank Information" icon={<AccountBalance />}>
            <Info label="IFSC Code" value={data.ifsc} icon={<CreditCard fontSize="small" />} />
            <Info label="Account No." value={data.bank_account_no} icon={<CreditCard fontSize="small" />} />
            <Info label="Branch Name" value={data?.bank_have_branch?.branch_name || 'N/A'} />
          </CompactCard>

             <form onSubmit={handleSubmit(onSubmit)}>
          <CompactCard title="KYC Update" icon={<AccountCircle />}>
            <Grid item xs={12}>
              <FormInput
                name="approval_status"
                type="on_demand_dropdown"
                control={control}
                rest={{ label: "KYC Status", fullWidth: true }}
                customOptionKeys={{ labelKey: "label", labelValue: "value" }}
                customOptions={KYC_STATUS_ARRAY}
                errors={errors}
              />
            </Grid>
            <Grid item xs={12}>
              <FormInput
                name="submitButton"
                type="submit"
                control={control}
                isLoading={getDriverDetailsLoader}
                rest={{ fullWidth: true, style: { marginTop: "10px" } }}
              >
                Update KYC status
              </FormInput>
            </Grid>
          </CompactCard>
                  </form>
        </Grid>
      </Grid>
    </Paper>
  );
}

// Reusable Components
const CompactCard = ({ title, icon, children }) => (
  <Card variant="outlined" sx={{ mb: 2 }}>
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <Grid container spacing={1}>
        {children}
      </Grid>
    </CardContent>
  </Card>
);

const Info = ({ label, value, icon }) => (
  <Grid item xs={6} sm={4}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      {icon && <Box sx={{ mr: 0.5 }}>{icon}</Box>}
      <Typography variant="caption" sx={{ fontWeight: 500 }}>{label}:</Typography>
    </Box>
    <Typography variant="body2" sx={{ ml: icon ? 2.5 : 0 }}>{value || 'N/A'}</Typography>
  </Grid>
);

const Status = ({ label, status }) => (
  <Grid item xs={6} sm={4}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      {status ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="error" />}
      <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 500 }}>{label}</Typography>
    </Box>
    <Typography variant="body2" sx={{ ml: 2 }}>{status ? 'Yes' : 'No'}</Typography>
  </Grid>
);

const StatusBadge = ({ label, color }) => (
  <Grid item xs={6} sm={4}>
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{ fontWeight: 600, textTransform: 'uppercase' }}
      />
    </Box>
  </Grid>
);

const Doc = ({ label, url }) => {
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);
  const isPDF = /\.pdf$/i.test(url);

  return (
    <Grid item xs={6} sm={4}>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>{label}</Typography>
      {isImage && (
        <img
          src={url}
          alt={label}
          style={{ width: 70, height: 70, borderRadius: 4, marginTop: 4, objectFit: 'cover' }}
        />
      )}
      {isPDF && (
        <iframe
          src={url}
          title={label}
          style={{ width: '100%', height: 80, border: '1px solid #ccc', marginTop: 4, borderRadius: 4 }}
        />
      )}
    </Grid>
  );
};

export default AMSViewDriver;
