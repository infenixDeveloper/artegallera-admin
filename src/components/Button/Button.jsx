import { Button } from "@mui/material";

const AppButton = ({ onClick, children, className, variant, ...rest }) => (
  <Button
    className={className}
    variant={variant}
    onClick={onClick}
    sx={{ minWidth: "10px" }}
    {...rest}
  >
    {children}
  </Button>
);

export default AppButton;
