import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// E-Book Typing task removed. Redirects to Tasks page.
export default function EbookTyping() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(createPageUrl("Tasks"), { replace: true });
  }, []);
  return null;
}
