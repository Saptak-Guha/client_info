// File: src/components/ClientButton.js
"use client";

import { Button } from "@/components/ui/button";

export function ClientButton() {
  const handleClick = () => {
    alert("Contact us for more info!");
  };

  return <Button onClick={handleClick}>Contact Us</Button>;
}
