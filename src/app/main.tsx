import { createRoot } from "react-dom/client";
import "@/styles/global.css";
import { migrateLegacyStorage } from "@/lib/storage";
import App from "./App";

// Before anything reads localStorage, including next-themes.
migrateLegacyStorage();

createRoot(document.getElementById("root")!).render(<App />);
