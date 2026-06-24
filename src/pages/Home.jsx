import { useEffect } from "react";
import { createPageUrl } from "@/utils";

export default function Home() {
  useEffect(() => {
    // Redirect to Dashboard
    window.location.href = "#" + createPageUrl("Dashboard");
  }, []);

  return null;
}
