import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const isTheme = (
  theme: string | undefined
): theme is Required<ToasterProps>["theme"] => {
  return theme ? ["light", "dark", "system"].includes(theme) : false;
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      theme={isTheme(theme) ? theme : "system"}
      toastOptions={{
        duration: 50000,
      }}
      {...props}
    />
  );
};

export { Toaster };
