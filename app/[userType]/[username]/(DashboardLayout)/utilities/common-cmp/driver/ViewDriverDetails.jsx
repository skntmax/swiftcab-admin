import React from 'react';
import {
  Avatar,
  Box,
  Typography,
  Link,
  Grid,
  Paper,
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
import { DirectionsCar, Person } from "@mui/icons-material";
import { KYC_STATUS } from '@constants';

function ViewDriverDetails({ data, userDetails }) {

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

  console.log("data?.vehicleDetails?.vehicle_id>>", data?.vhicleDetails?.vehicle_id)

  return (
    <Paper
      elevation={3}
      sx={{
        p: 5,
        borderRadius: 3,
        maxWidth: 1000,
        mx: 'auto',
        mt: 6,
        textAlign: 'center', // Centralized alignment
      }}
    >
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        direction="column"
      >

        {/* --- Vehicle Info Section --- */}
        <Grid item xs={12} sx={{ width: '100%' }}>
          <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          mb: 4,
        }}
      >
        {/* Profile Section */}
        <Box
          sx={{
            
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
          }}
        >
          <Avatar
            src={userDetails?.profile_pic || ""}
            alt="Driver Profile"
            sx={{ width: 130, height: 130 }}
          />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            <AccountCircle fontSize="small" sx={{ mr: 1 }} />
            {userDetails?.username || "N/A"}
          </Typography>
        </Box>

        {/* Vehicle Assigned Info */}
        <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        backgroundColor: "#fafafa",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <DirectionsCar sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Vehicle Assigned
        </Typography>
      </Box>

  {/* Details */}
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
        </Box>
      </Box>
        </Grid>

        {/* --- Document Section --- */}
        <Grid item xs={12} sx={{ width: '100%' }}>
          <InfoCard title="Document Links" icon={<DocumentScanner />}>
            <Grid container spacing={2} justifyContent="center">
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
        </Grid>

        {/* --- Account & Verification Section --- */}
        <Grid item xs={12} sx={{ width: '100%' }}>
          <InfoCard title="Account & Verification Info" icon={<AttachMoney />}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Info label="Wallet Code" value={data.wallet_code} />
                <Info label="Wallet Balance" value={`₹${data.wallet_balance}`} />
                <Info
                  label="Bank Verified"
                  value={data.is_bank_varified ? 'Yes' : 'No'}
                  icon={
                    data.is_bank_varified ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Info
                  label="Driver Verified"
                  value={ [KYC_STATUS.PENDING,KYC_STATUS.INITIATED].includes(data.is_varified)? 'NO' : 'YES'}
                  icon={
                      [KYC_STATUS.VERIFIED, KYC_STATUS.COMPLETED].includes(data?.is_varified) ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )
                    }
                  />
                <Info
                  label="Created On"
                  value={new Date(data.created_on).toLocaleString()}
                  icon={<CalendarToday />}
                />
                <Info
                  label="Updated On"
                  value={new Date(data.updated_on).toLocaleString()}
                  icon={<CalendarToday />}
                />
              </Grid>
            </Grid>
          </InfoCard>
        </Grid>

        {/* --- Bank Info Section --- */}
        <Grid item xs={12} sx={{ width: '100%' }}>
          <InfoCard title="Bank Information" icon={<AccountBalance />}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Info
                  label="IFSC Code"
                  value={data.ifsc || 'N/A'}
                  icon={<CreditCard />}
                />
                <Info
                  label="Account Number"
                  value={data.bank_account_no || 'N/A'}
                  icon={<CreditCard />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Info
                  label="Branch Name"
                  value={data?.bank_have_branch?.branch_name || 'N/A'}
                  icon={<CreditCard />}
                />
              </Grid>
            </Grid>
          </InfoCard>
        </Grid>
      </Grid>
    </Paper>
  );
}

/* ------------------------- SUPPORT COMPONENTS ------------------------- */

const Field = ({ label, url }) => {
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);
  const isPDF = /\.pdf$/i.test(url);

  return (
    <Box sx={{ mb: 2, textAlign: 'center' }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}:
      </Typography>
      {isImage && (
        <Box sx={{ mt: 1 }}>
          <img
            src={url}
            alt={label}
            style={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 6
            }}
          />
        </Box>
      )}
      {isPDF && (
        <Box sx={{ mt: 1 }}>
          <iframe
            src={url}
            title={label}
            width="100%"
            height="100"
            style={{ border: '1px solid #ccc', borderRadius: 6 }}
          />
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'center' }}>
        <Link
          href={url}
          target="_blank"
          rel="noopener"
          underline="hover"
          color="primary"
        >
          View
        </Link>
        <Link
          target="_blank"
          href={url}
          download
          underline="hover"
          color="secondary"
        >
          Download
        </Link>
      </Box>
    </Box>
  );
};

const InfoCard = ({ title, icon, children }) => (
  <Card elevation={2} sx={{ mb: 3, mx: 'auto', maxWidth: 700 }}>
    <CardHeader
      title={title}
      avatar={icon}
      titleTypographyProps={{
        variant: 'h6',
        fontWeight: 'bold',
        textAlign: 'center'
      }}
    />
    <CardContent>{children}</CardContent>
  </Card>
);

const Info = ({ label, value, icon }) => (
  <Box
    sx={{
      mb: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}
  >
    {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  </Box>
);

export default ViewDriverDetails;
