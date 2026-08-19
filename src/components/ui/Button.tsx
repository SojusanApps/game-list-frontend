import { Button as MantineButton } from "@mantine/core";
import React from "react";

type ButtonVariant = "default" | "secondary" | "destructive" | "success" | "outline" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  uppercase?: boolean;
  isLoading?: boolean;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}

const variantMap: Record<ButtonVariant, { variant: string; color?: string }> = {
  default: { variant: "filled" },
  secondary: { variant: "filled", color: "secondary" },
  destructive: { variant: "filled", color: "error" },
  success: { variant: "filled", color: "success" },
  outline: { variant: "outline" },
  ghost: { variant: "subtle" },
  link: { variant: "transparent" },
};

const sizeMap: Record<ButtonSize, string> = {
  default: "md",
  sm: "sm",
  lg: "lg",
  icon: "md",
  xl: "lg",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      fullWidth,
      uppercase,
      isLoading,
      disabled,
      children,
      leftSection,
      rightSection,
      ...props
    },
    ref,
  ) => {
    const mapped = variantMap[variant];
    const mantineSize = sizeMap[size];

    return (
      <MantineButton
        ref={ref}
        variant={mapped.variant}
        color={mapped.color}
        size={mantineSize}
        fullWidth={fullWidth}
        loading={isLoading}
        disabled={disabled}
        leftSection={leftSection}
        rightSection={rightSection}
        styles={{
          root: {
            ...(uppercase && { textTransform: "uppercase" as const, letterSpacing: "0.05em" }),
            ...(size === "icon" && { width: "40px", paddingInline: 0 }),
            ...(variant === "link" && { textUnderlineOffset: "4px" }),
          },
        }}
        className={className}
        {...props}
      >
        {children}
      </MantineButton>
    );
  },
);
Button.displayName = "Button";

export { Button };
