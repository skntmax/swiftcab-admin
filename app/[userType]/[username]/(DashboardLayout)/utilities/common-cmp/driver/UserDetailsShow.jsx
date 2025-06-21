import React from 'react';
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
  CardHeader
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

const UserDetailsShow = ({ data, isLoading = false }) => {
  return (
    <>
      {/* Fullscreen Loader */}
      <Backdrop
        open={isLoading}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {!isLoading && data && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1000, mx: 'auto' }}>
          <Grid container spacing={4}>
            {/* Avatar + ID */}
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={data.profile_pic || ""}
                alt="Driver Profile"
                sx={{ width: 130, height: 130, margin: 'auto' }}
              />
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                <AccountCircle fontSize="small" sx={{ mr: 1 }} />
                Driver ID: {data.driver}
              </Typography>
            </Grid>

            {/* Info Cards */}
            <Grid item xs={12} md={8}>
              {/* Document Links */}
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
                  </Grid>
                </Grid>
              </InfoCard>

              {/* Account & Verification Info */}
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

              {/* Bank Info */}
              <InfoCard title="Bank Information" icon={<AccountBalance />}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Info label="IFSC Code" value={data.ifsc || "N/A"} icon={<CreditCard />} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Info label="Branch Name" value={data.bank_account_branch || "N/A"} icon={<CreditCard />} />
                  </Grid>
                </Grid>
              </InfoCard>
            </Grid>
          </Grid>
        </Paper>
      )}
    </>
  );
};

const InfoCard = ({ title, icon, children }) => (
  <Card elevation={1} sx={{ mb: 3 }}>
    <CardHeader
      title={title}
      avatar={icon}
      titleTypographyProps={{ variant: 'h6' }}
    />
    <CardContent>{children}</CardContent>
  </Card>
);

const Field = ({ label, url }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}:</Typography>
    <Link href={url} target="_blank" rel="noopener" underline="hover" color="primary">
      View Document
    </Link>
  </Box>
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

export default UserDetailsShow;
