import { css } from "../../../styled-system/css";

/**
 * MDX / identity prose — defined at module scope so Panda’s static extractor
 * emits nested selector utilities (plain objects passed to `css()` from other
 * files are not reliably extracted, which produced class names without CSS).
 */
export const blogContentProseClass = css({
  maxWidth: "65ch",
  mx: "auto",
  color: "rgba(255,255,255,0.85)",

  "& h1": {
    fontSize: "3xl",
    fontWeight: "bold",
    mt: "2rem",
    mb: "0.75rem",
  },
  "& h2": {
    fontSize: "2xl",
    fontWeight: "bold",
    mt: "1.5rem",
    mb: "0.75rem",
  },
  "& h3": {
    fontSize: "xl",
    fontWeight: "bold",
    mt: "1.25rem",
    mb: "0.5rem",
  },
  "& p": {
    mb: "1rem",
    lineHeight: "relaxed",
  },
  "& ul": {
    listStyleType: "disc",
    pl: "1.5rem",
    mb: "1rem",
  },
  "& ol": {
    listStyleType: "decimal",
    pl: "1.5rem",
    mb: "1rem",
  },
  "& li": { mb: "0.5rem" },
  "& blockquote": {
    borderLeftWidth: "4px",
    borderLeftColor: "gray.600",
    pl: "1rem",
    fontStyle: "italic",
    my: "1rem",
  },
  "& pre": {
    bg: "transparent",
    p: "1rem",
    borderRadius: "md",
    overflowX: "auto",
    mb: "1rem",
    fontSize: "sm",
    lineHeight: "1.6",
  },
  "& .hljs": {
    bg: "transparent !important",
  },
  "& code": {
    fontFamily: "mono",
    bg: "rgba(255,255,255,0.08)",
    px: "0.2em",
    borderRadius: "sm",
    fontSize: "0.9em",
  },
  "& pre code": {
    bg: "transparent",
    p: "0",
  },
  "& a": {
    color: "blue.400",
    textDecoration: "underline",
    _hover: { color: "blue.300" },
  },
  "& img": {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "md",
    my: "1rem",
  },
  "& hr": {
    border: "none",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "gray.700",
    my: "2rem",
    w: "full",
  },
});
