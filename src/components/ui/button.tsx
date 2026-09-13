import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/lib/utils";

const variants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-heading",
        outline: "border border-border bg-white text-primary hover:bg-accent",
        ghost: "text-primary hover:bg-accent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
type Props = ComponentProps<"button"> &
  VariantProps<typeof variants> & { asChild?: boolean };
export function Button({
  asChild = false,
  variant,
  className,
  ...props
}: Props): ReactElement {
  const Component = asChild ? Slot : "button";
  return (
    <Component className={cn(variants({ variant }), className)} {...props} />
  );
}
