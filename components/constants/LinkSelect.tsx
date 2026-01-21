"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

interface LinkSelectProps {
  options: { label: string; value: string }[];
}

const LinkSelect: React.FC<LinkSelectProps> = ({ options }) => {
  const router = useRouter();

  // get last part of pathname
  const currentPath = usePathname();
  const pathname = currentPath ? currentPath.split("/").pop() : "";

  if (!router) {
    return null;
  }

  return (
    <select value={pathname} onChange={(e) => router.push(e.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default LinkSelect;
