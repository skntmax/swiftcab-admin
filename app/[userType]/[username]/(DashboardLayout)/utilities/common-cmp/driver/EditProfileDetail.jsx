import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import { FormInput } from "@components/FormController";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { yupResolver } from "@hookform/resolvers/yup";
import { driverProfileSchema } from "@components/FormSchema/DriverDetails/DriverDetail.js";
import { DevTool } from "@hookform/devtools";
import driversApi, {
  useGetBankBranchMutation,
  useGetBanksMutation,
} from "@app/libs/apis/driver";
import { useAppDispatch } from "@app/libs/store";
import { getUniqueString } from "@utils";
import { useFileUploader } from "@app/libs/apis/FileUploaderHook";

const EditProfileDetail = () => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      profile_pic: null,
      DL: null,
      RC: null,
      insurance: null,
      pan_card: null,
      adhar_card: null,
      bank_account: "",
      ifsc: "",
      bank_account_branch: ""
    },
    resolver: yupResolver(driverProfileSchema),
  });

  const dispatch = useAppDispatch();
  const [loader, setLoader] = useState(false);
  const [bankOptions, setBankOptions] = useState([]);
  const { uploadFile, loading, error } = useFileUploader();

  const [getBanks, { data: getBankData, isLoading: getBankDataLoading }] =
    useGetBanksMutation();
  const [
    getBankBranch,
    { data: getBankBranchData, isLoading: getBankBranchDataLoading },
  ] = useGetBankBranchMutation();

  const onSubmit = (data) => {
    console.log(data);
  };

  // Reset bank branch when bank account changes
  useEffect(() => {
    if (watch("bank_account")) {
      driversApi.util.resetApiState();
      getBankBranch(`bankId=${watch("bank_account")}`)
    }
  }, [watch("bank_account")]);

  // Helper function to trigger upload
  const handleFileUpload = (fieldName) => {
    // Case 1: If it's already a string URL, do nothing or handle as needed
    const files = watch(fieldName);

    if (typeof files === "string") {
      console.log(`${fieldName} is already a URL:`, files);
      return;
    }


    if (files && Array.from(files).length) {
      const file = files[0];
      const ext = file.name.split(".").pop();
      const fileName = file.name + getUniqueString() + "." + ext;

      uploadFile({
        file,
        fileName,
        contentType: file.type,
      }).then((uploadedUrl) => {
        console.log(`${fieldName} Uploaded URL:`, uploadedUrl);
        setValue(fieldName ,uploadedUrl,{shouldTouch:true} )
        // Optionally, update form state with uploadedUrl
        // setValue(fieldName, uploadedUrl);
      });
    }
  };

  

  // Apply upload logic for each upload field
  useEffect(() => {
    handleFileUpload("profile_pic");
  }, [watch("profile_pic")]);

  useEffect(() => {
    handleFileUpload("DL");
  }, [watch("DL")]);

  useEffect(() => {
    handleFileUpload("RC");
  }, [watch("RC")]);

  useEffect(() => {
    handleFileUpload("insurance");
  }, [watch("insurance")]);

  useEffect(() => {
    handleFileUpload("pan_card");
  }, [watch("pan_card")]);

  useEffect(() => {
    handleFileUpload("adhar_card");
  }, [watch("adhar_card")]);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
        Update Driver Detail
      </Typography>

      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 3, maxWidth: 1000, mx: "auto" }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {/* Profile Preview */}
            {watch("profile_pic") && (
              <Box
                component="img"
                src={watch("profile_pic")}
                alt="Profile Preview"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ccc",
                }}
              />
            )}

            {/* Profile Picture Upload */}
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FormInput
                name="profile_pic"
                type="upload"
                control={control}
                startIcon={<AccountCircleIcon />}
                rest={{ label: "Upload Profile Picture" }}
                errors={errors}
                isLoading={loading}
              />
            </Grid>

            {/* Document Uploads */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormInput
                    name="DL"
                    errors={errors}
                    type="upload"
                    preview={true}
                    startIcon={<PictureAsPdfIcon />}
                    control={control}
                    multiple={true}
                    rest={{ label: "DL" }}
                    isLoading={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput
                    name="RC"
                    errors={errors}
                    type="upload"
                    preview={true}
                    startIcon={<PictureAsPdfIcon />}
                    control={control}
                    rest={{ label: "RC Document URL" }}
                    isLoading={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput
                    name="insurance"
                    errors={errors}
                    type="upload"
                    preview={true}
                    startIcon={<PictureAsPdfIcon />}
                    control={control}
                    rest={{ label: "Insurance URL" }}
                    isLoading={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput
                    name="pan_card"
                    errors={errors}
                    type="upload"
                    preview={true}
                    startIcon={<PictureAsPdfIcon />}
                    control={control}
                    rest={{ label: "PAN Card URL" }}
                    isLoading={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput
                    name="adhar_card"
                    errors={errors}
                    type="upload"
                    preview={true}
                    startIcon={<PictureAsPdfIcon />}
                    control={control}
                    rest={{ label: "Aadhar Card URL" }}
                    isLoading={loading}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Bank and IFSC Inputs */}
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <FormInput
                    name="bank_account"
                    isLoading={getBankDataLoading}
                    type="on_demand_dropdown"
                    control={control}
                    rest={{ label: "Bank Account", fullWidth: true }}
                    onCustomFuntionCaller={getBanks}
                    customOptionKeys={{
                      labelKey: "bank_name",
                      labelValue: "id",
                    }}
                    customOptions={getBankData?.data || []}
                    errors={errors}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormInput
                    name="ifsc"
                    type="text"
                    control={control}
                    rest={{
                      label: "IFSC Code",
                      fullWidth: true,
                      helperText: errors?.ifsc?.message,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Bank Branch Dropdown */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormInput
                    name="bank_account_branch"
                    isLoading={getBankBranchDataLoading}
                    type="on_demand_dropdown"
                    control={control}
                    rest={{ label: "Bank Account Branch", fullWidth: true }}
                    onCustomFuntionCaller={() =>
                      getBankBranch(`bankId=${watch("bank_account")}`)
                    }
                    customOptionKeys={{
                      labelKey: "branch_name",
                      labelValue: "id",
                    }}
                    customOptions={getBankBranchData?.data || []}
                    errors={errors}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <FormInput
                name="submitButton"
                type="submit"
                control={control}
                isLoading={false}
                rest={{ fullWidth: true }}
              >
                Save Driver Info
              </FormInput>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <DevTool control={control} />
    </>
  );
};

export default EditProfileDetail;


// {
//     "bank_account_branch": "22",
//     "ifsc": "SBIN0012345",
//     "bank_account": "2",
//     "adhar_card": "https://swiftcab-dev.s3.ap-south-1.amazonaws.com/swiftcab-dev/assets/Insurance Operations Sample Life Questions 1.pdf1752616489184-9xs9yupdm.pdf",
//     "pan_card": "https://swiftcab-dev.s3.ap-south-1.amazonaws.com/swiftcab-dev/assets/Screenshot Capture - 2025-04-13 - 01-46-39.png1752616485000-gf0id6bvc.png",
//     "insurance": "https://swiftcab-dev.s3.ap-south-1.amazonaws.com/swiftcab-dev/assets/Screenshot Capture - 2025-06-04 - 00-59-38.png1752616479787-uuryhoa1i.png",
//     "RC": "https://swiftcab-dev.s3.ap-south-1.amazonaws.com/swiftcab-dev/assets/Screenshot Capture - 2025-06-04 - 01-13-51.png1752616475937-c9pi85byx.png",
//     "DL": "https://swiftcab-dev.s3.ap-south-1.amazonaws.com/swiftcab-dev/assets/WhatsApp Image 2025-06-02 at 8.41.20 PM.jpeg1752616472786-cxvqtyqci.jpeg",
//     "profile_pic": "https://swiftcab-dev.s3.ap-south-1.amazonaws.com/swiftcab-dev/assets/Screenshot Capture - 2025-06-04 - 01-15-52.png1752616469457-3sl4k0w4s.png",
//     "submitButton": false
// }