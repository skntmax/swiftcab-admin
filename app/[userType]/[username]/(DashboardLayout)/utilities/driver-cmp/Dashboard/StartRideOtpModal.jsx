import {
  Modal,
  Box,
  Button,
  Typography,
  IconButton,
  Divider,
  useMediaQuery
} from "@mui/material";
import { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

const OTP_LENGTH = 4;

export default function StartRideOtpModal({
  open,
  onClose,
  onVerify,
  loading
}) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [minimized, setMinimized] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== OTP_LENGTH) {
      alert("Enter valid OTP");
      return;
    }
    onVerify(finalOtp);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        hideBackdrop={minimized}
        BackdropProps={{ invisible: minimized }}
      >
        <Box
          sx={{
            position: "fixed",

            // 📱 Mobile = bottom sheet
            bottom: isMobile ? 0 : "auto",
            top: isMobile ? "auto" : "50%",
            left: "50%",
            transform: isMobile
              ? "translateX(-50%)"
              : "translate(-50%, -50%)",

            width: isMobile ? "100%" : 380,
            maxHeight: isMobile ? "85vh" : "auto",

            bgcolor: "background.paper",
            borderRadius: isMobile ? "16px 16px 0 0" : 3,
            boxShadow: 24,
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={2}
            py={1.5}
          >
            <Typography fontWeight={600}>Start Ride OTP</Typography>

            <Box>
              <IconButton
                onClick={() => setMinimized((p) => !p)}
                disabled={loading}
              >
                {minimized ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>

              <IconButton onClick={onClose} disabled={loading}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Divider />

          {/* BODY */}
          {!minimized && (
            <Box px={2} pb={2}>
              <Typography
                variant="body2"
                textAlign="center"
                color="text.secondary"
                mt={2}
              >
                Ask customer for OTP to start ride
              </Typography>

              {/* OTP */}
              <Box display="flex" justifyContent="center" gap={1.5} mt={3}>
                {otp.map((digit, index) => (
                  <Box
                    key={index}
                    component="input"
                    disabled={loading}
                    ref={(el) => (inputsRef.current[index] = el)}
                    value={digit}
                    onChange={(e) =>
                      handleChange(e.target.value, index)
                    }
                    inputMode="numeric"
                    maxLength={1}
                    sx={{
                      width: isMobile ? 50 : 55,
                      height: isMobile ? 55 : 60,
                      textAlign: "center",
                      fontSize: 24,
                      fontWeight: "bold",
                      borderRadius: 2,
                      border: "2px solid",
                      borderColor: digit ? "primary.main" : "grey.300",
                      outline: "none",
                    }}
                  />
                ))}
              </Box>

              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ height: 48, borderRadius: 2 }}
                  onClick={handleVerify}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={22} /> : "Verify & Start Ride"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* 🔽 MINIMIZED FLOATING PILL (Uber-style) */}
      {minimized && (
        <Box
          onClick={() => setMinimized(false)}
          sx={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 260,
            height: 56,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            cursor: "pointer",
            zIndex: 1301,
          }}
        >
          <Typography fontWeight={600}>Enter OTP</Typography>
          <KeyboardArrowUpIcon />
        </Box>
      )}


      <Backdrop
        open={loading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" />
          <Typography mt={2}>Verifying OTP...</Typography>
        </Box>
      </Backdrop>

    </>
  );
}
