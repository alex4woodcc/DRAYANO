/**
 * React application entry point. Theme is initialized in index.html
 * before this script executes to avoid a flash of incorrect color.
*/
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
