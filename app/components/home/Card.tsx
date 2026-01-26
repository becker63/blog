import * as React from "react";
import { css } from "../../../styled-system/css";
import { Route } from "../shared/Route";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface CardProps {
  title: string;
  desc: string;
  icon?: IconDefinition;
  color: string;
  href: string;
}

export const Card = ({ title, desc, icon, color, href }: CardProps) => {
  return (
    <div className={css({ display: "flex", justifyContent: "space-between" })}>
      <div>
        <Route href={href} size={30} color={color}>
          <h3
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              _hover: { color: "white" },
            })}
          >
            {title}
          </h3>
        </Route>

        {/* Description spacing now matches LatestBlog mobile */}
        <p
          className={css({
            color: "gray.400",
            fontSize: "sm",
            //paddingTop: "-5",
            mt: "1", // 👈 adds breathing room under title
            lineHeight: "short", // 👈 matches blog card text rhythm
          })}
        >
          {desc}
        </p>
      </div>

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        {icon ? <FontAwesomeIcon icon={icon} size="xl" /> : null}
      </div>
    </div>
  );
};
