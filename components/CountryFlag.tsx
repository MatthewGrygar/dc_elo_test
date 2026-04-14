"use client";

interface CountryFlagProps {
  code: string;
  size?: number;
  showCode?: boolean;
}

export function CountryFlag({ code, size = 18, showCode = false }: CountryFlagProps) {
  return (
    <span
      title={code}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <span
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
        <img
          src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
          alt={code}
          style={{
            width: size * 1.4,
            height: size * 1.4,
            objectFit: "cover",
          }}
        />
      </span>
      {showCode && (
        <span
          style={{
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          {code}
        </span>
      )}
    </span>
  );
}
