"use client";

import ReactCountryFlag from "react-country-flag";

interface CountryFlagProps {
  code: string;
  size?: number;
}

export function CountryFlag({ code, size = 18 }: CountryFlagProps) {
  return (
    <span
      title={code}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        border: "1px solid hsl(var(--border) / 0.5)",
        lineHeight: 1,
      }}
    >
      <ReactCountryFlag
        countryCode={code}
        svg
        style={{
          width: size * 1.4,
          height: size * 1.4,
          objectFit: "cover",
        }}
      />
    </span>
  );
}
