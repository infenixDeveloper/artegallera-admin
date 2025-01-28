import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "gradient" },
          style: {
            width: "100%",
            background: "linear-gradient(90deg, #969602 0%, #eeee00 100%)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "60px",
            opacity: 1,
            transition: "opacity 0.3s ease",
            "&:hover": {
              opacity: 0.9,
            },
          },
        },
        {
          props: { variant: "gradient-square" },
          style: {
            width: "100%",
            background: "linear-gradient(90deg, #969602 0%, #eeee00 100%)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "0",
            opacity: 1,
            transition: "opacity 0.3s ease",
            "&:hover": {
              opacity: 0.9,
            },
          },
        },
      ],
    },
  },
});

export default theme;
