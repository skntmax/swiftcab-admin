import React, {  useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Typography,
  Button,
} from "@mui/material";
import { Edit, Block, Delete } from "@mui/icons-material";
import { ReduxProvider } from "@app/libs/slice/useReduxSelector";
import ExtraComponent from "../common-cmp/ExtraComponent";
import { extraPathsUrls } from "@constants/urls";
import { useGetMenuPermissionsMutation } from "@app/libs/apis/admin";
import CreatePermission from "./ExtraPathComponents/CreatePermission";
import EditPermissions from "./ExtraPathComponents/EditPermissions";
const PermissionManagement = () => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [ permissionsData , setPermissionsData ] = useState([])
  const [ count , setCount ] = useState()
  const [ getPermissionList, {data:permissionData ,isLoading:permissionIsLoading} ] = useGetMenuPermissionsMutation()
  const [ activeExtraPath, setActiveExtraPath ] = useState("")
  
  const filteredData =
    selectedPermissions.length > 0
      ? permissionsData.filter((permission) => selectedPermissions.includes(permission.permission_name))
      : permissionsData;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(()=>{
    getPermissionList({
        page:page+1,
       rowsPerPage 
    })
  },[page, rowsPerPage])

   useEffect(() => {
      if (permissionData?.data) {
        setPermissionsData(permissionData?.data?.permissions);
        setCount(permissionData?.data?.totalCount || 0);

      }
    }, [permissionData?.data]);
  

    // for adding extra paths 
    const handleBack = ()=> ( setActiveExtraPath("") )
   switch (activeExtraPath) {
    case extraPathsUrls.create_permission:
      return renderWithBackButton(<CreatePermission {...{selectedPermissions ,filteredData}} />, handleBack);
    case extraPathsUrls.edit_permission:
      return renderWithBackButton(<EditPermissions {...{selectedPermissions,filteredData}} />,handleBack);
    default:
      break;
    }
    // for adding extra paths

  return (
  <div style={{ padding: 20 }}>
  {/* Title + Create Button in one row */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Typography
      variant="h4"
      gutterBottom
      style={{ fontWeight: "bold", color: "#3f51b5" }}
    >
      Permission Management
    </Typography>

      <Button
        variant="outlined"
        color="primary"
        size="small"
        onClick={() => setActiveExtraPath(extraPathsUrls.create_permission)}
        style={{ marginBottom: "10px" }}
      >
        Create Permissions
      </Button>
  </div>

  <Typography
    variant="subtitle1"
    style={{ marginBottom: 20, color: "#555" }}
  >
    Search and manage permissions efficiently.
  </Typography>

  {/* Typeahead Search */}
  <Autocomplete
    multiple
    options={permissionsData.map((p) => p.permission_name)}
    getOptionLabel={(option) => option}
    value={selectedPermissions}
    onChange={(event, newValue) => setSelectedPermissions(newValue)}
    renderInput={(params) => (
      <TextField {...params} label="Filter by Permission" variant="outlined" fullWidth />
    )}
    style={{ marginBottom: 20 }}
  />

  {/* Permissions Table */}
  {filteredData && Array.isArray(filteredData) && filteredData.length>0 && <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow style={{ backgroundColor: "#f5f5f5" }}>
          <TableCell><b>ID</b></TableCell>
          <TableCell><b>Permission</b></TableCell>
          <TableCell><b>Actions</b></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        { filteredData.map((permission) => (
            <TableRow key={permission?.id || 0}>
              <TableCell>{permission?.id || ""}</TableCell>
              <TableCell>{permission?.permission_name || ""}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={(e) => {
                  setSelectedPermissions(permission?.permission_name)
                  setActiveExtraPath(extraPathsUrls.edit_permission)
                  }
                 } ><Edit /></IconButton>
                <IconButton color="warning"><Block /></IconButton>
                <IconButton color="error"><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </TableContainer> }

  {/* Pagination */}
  <TablePagination
    rowsPerPageOptions={[5, 10, 15]}
    component="div"
    count={count}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />
</div>

  );
};

 const renderWithBackButton = (child,handleBack) => (
    <div>
      <Button 
        variant="outlined" 
        color="primary" 
        size="small" 
        onClick={handleBack} 
        style={{ marginBottom: "10px" }}
      >
        Back
      </Button>
      {child}
    </div>
  );








export default PermissionManagement;
