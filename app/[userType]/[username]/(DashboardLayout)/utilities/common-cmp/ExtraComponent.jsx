import { useContext } from "react";
import { Button } from "@mui/material"; // ✅ using MUI for back button
import { ReduxProvider } from "@app/libs/slice/useReduxSelector";
import CreatePermission from "../admin-cmp/ExtraPathComponents/CreatePermission";
import { extraPathsUrls } from "@constants/urls";

function ExtraComponent() {
  const { reduxValues, setActiveExtraPath, activeExtraPath } = useContext(ReduxProvider);

  const handleBack = () => {
    setActiveExtraPath(null); // 
  };

  const renderWithBackButton = (child) => (
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

  switch (activeExtraPath) {
    case extraPathsUrls.create_permission:
      return renderWithBackButton(<CreatePermission />);
    case extraPathsUrls.edit_permission:
      return renderWithBackButton(<div>Edit Permission</div>);
    default:
      return null;
  }
}

export default ExtraComponent;
