import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Typography,
  Link,
  Grid,
  Paper,
  Backdrop,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  AccountCircle,
  AttachMoney,
  CheckCircle,
  Cancel,
  CalendarToday,
  DocumentScanner,
  AccountBalance,
  CreditCard
} from '@mui/icons-material';
function ViewDriverDetails({data,userDetails}) {
 
   const hasData =
    data &&
    (data.DL || data.RC || data.insurance || data.adhar_card || data.pan_card || data.profile_pic);

  if (!hasData) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 6,
          borderRadius: 3,
          textAlign: 'center',
          maxWidth: 700,
          mx: 'auto',
          mt: 10,
          background: '#f5f5f5'
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'warning.main',
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2
          }}
        >
          <Cancel fontSize="large" />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          No Driver Data Found
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Please update driver details to start taking rides.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1000, mx: 'auto' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar
            src={data.profile_pic || ''}
            alt="Driver Profile"
            sx={{ width: 130, height: 130, margin: 'auto' }}
          />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
            <AccountCircle fontSize="small" sx={{ mr: 1 }} />
            Username: {userDetails?.username || ""}
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
         <InfoCard title="Document Links" icon={<DocumentScanner />}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Field label="Driving License" url={data.DL} />
              <Field label="RC Document" url={data.RC} />
              <Field label="Insurance" url={data.insurance} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field label="PAN Card" url={data.pan_card} />
              <Field label="Aadhar Card" url={data.adhar_card} />
               <Field label="Passbook" url={data.passbook} /> 
            </Grid>
          </Grid>
        </InfoCard>
          <InfoCard title="Account & Verification Info" icon={<AttachMoney />}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Info label="Wallet Code" value={data.wallet_code} />
                <Info label="Wallet Balance" value={`₹${data.wallet_balance}`} />
                <Info
                  label="Bank Verified"
                  value={data.is_bank_varified ? 'Yes' : 'No'}
                  icon={data.is_bank_varified ? <CheckCircle color="success" /> : <Cancel color="error" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Info
                  label="Driver Verified"
                  value={data.is_varified ? 'Yes' : 'No'}
                  icon={data.is_varified ? <CheckCircle color="success" /> : <Cancel color="error" />}
                />
                <Info label="Created On" value={new Date(data.created_on).toLocaleString()} icon={<CalendarToday />} />
                <Info label="Updated On" value={new Date(data.updated_on).toLocaleString()} icon={<CalendarToday />} />
              </Grid>
            </Grid>
          </InfoCard>

         <InfoCard title="Bank Information" icon={<AccountBalance />}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Info label="IFSC Code" value={data.ifsc || 'N/A'} icon={<CreditCard />} />
              <Info label="Account Number" value={data.bank_account_no || 'N/A'} icon={<CreditCard />} /> {/* ✅ ADDED */}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Info label="Branch Name" value={data?.bank_have_branch?.branch_name || 'N/A'} icon={<CreditCard />} />
            </Grid>
          </Grid>
        </InfoCard>
        </Grid>
      </Grid>
    </Paper>
  )
}

const Field = ({ label, url }) => {
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);
  const isPDF = /\.pdf$/i.test(url);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}:</Typography>
      {isImage && (
        <Box sx={{ mt: 1 }}>
          <img src={url} alt={label} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
        </Box>
      )}
      {isPDF && (
        <Box sx={{ mt: 1 }}>
          <iframe src={url} title={label} width="100%" height="100" style={{ border: '1px solid #ccc', borderRadius: 6 }} />
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Link href={url} target="_blank" rel="noopener" underline="hover" color="primary">View</Link>
        <Link target="_blank" href={url} download underline="hover" color="secondary">Download</Link>
      </Box>
    </Box>
  );
};


const InfoCard = ({ title, icon, children }) => (
  <Card elevation={1} sx={{ mb: 3 }}>
    <CardHeader title={title} avatar={icon} titleTypographyProps={{ variant: 'h6' }} />
    <CardContent>{children}</CardContent>
  </Card>
);

const Info = ({ label, value, icon }) => (
  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
    {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}:</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  </Box>
);


export default ViewDriverDetails
