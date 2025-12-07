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

/**
 * A card component displaying a title, description, and optional icon.
 * Used for navigation items like Resume and Blogs on the homepage.
 */
export const Card = ({ title, desc, icon, color, href }: CardProps) => {
    return (
        <div className={css({ display: "flex", justifyContent: "space-between" })}>
            <div className="">
                <Route href={href} size={30} color={color}>
                    <h3
                        className={css({
                            fontSize: "2xl",
                            fontWeight: "bold",
                            _hover: { color: "white" },
                        })}
                        color={color}
                    >
                        {title}
                    </h3>
                </Route>
                <p className={css({ color: "gray.400" })}>{desc}</p>
            </div>
            <div
                className={css({
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                })}
            >
                {icon ? <FontAwesomeIcon icon={icon} size="xl" /> : <></>}
            </div>
        </div>
    );
};
