import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import muiTheme from "./config/muiTheme.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </MuiThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
