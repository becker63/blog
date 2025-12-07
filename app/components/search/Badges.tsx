import { css } from "../../../styled-system/css";

const badgeStyle = (bgColor: string, textColor: string, darkBg: string, darkText: string) =>
  css({
    bg: bgColor,
    color: textColor,
    fontSize: "xs",
    fontWeight: "medium",
    mr: "2",
    px: "2.5",
    py: "0.5",
    borderRadius: "full",
    _dark: { bg: darkBg, color: darkText },
  });

const TechBadge = () => <span className={badgeStyle("blue.100", "blue.800", "blue.900", "blue.300")}>Tech</span>;

const JSBadge = () => <span className={badgeStyle("gray.100", "gray.800", "gray.700", "gray.300")}>JavaScript</span>;

const PhilosophyBadge = () => <span className={badgeStyle("red.100", "red.800", "red.900", "red.300")}>Philosophy</span>;

const WritingBadge = () => <span className={badgeStyle("green.100", "green.800", "green.900", "green.300")}>Writing</span>;

const ShitpostBadge = () => <span className={badgeStyle("yellow.100", "yellow.800", "yellow.900", "yellow.300")}>Shitpost</span>;

const CommentaryBadge = () => <span className={badgeStyle("indigo.100", "indigo.800", "indigo.900", "indigo.300")}>Commentary</span>;

const GenericBadge = ({ text }: { text: string }) => (
  <span className={badgeStyle("gray.100", "gray.800", "gray.700", "gray.300")}>{text}</span>
);

export type tags =
  | "tech"
  | "writing"
  | "commentary"
  | "philosophy"
  | "shitpost"
  | "js"
  | string; // Allow other strings

export const DescriptionTags = (tags: tags[]) => {
  const components = [] as JSX.Element[];
  const safeTags = Array.isArray(tags) ? tags : [];
  safeTags.forEach((el, i) => {
    if (i < 3) { // Increased limit slightly
      const tag = el.toLowerCase();
      if (tag === "tech") {
        components.push(<TechBadge key={i} />);
      } else if (tag === "writing") {
        components.push(<WritingBadge key={i} />);
      } else if (tag === "commentary") {
        components.push(<CommentaryBadge key={i} />);
      } else if (tag === "philosophy") {
        components.push(<PhilosophyBadge key={i} />);
      } else if (tag === "shitpost") {
        components.push(<ShitpostBadge key={i} />);
      } else if (tag === "js") {
        components.push(<JSBadge key={i} />);
      } else {
        components.push(<GenericBadge key={i} text={el} />);
      }
    }
  });
  return components;
};
