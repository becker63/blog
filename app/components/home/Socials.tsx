import { css } from "../../../styled-system/css";
import { Route } from "../shared/Route";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGithub,
    faInstagram,
    faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

/**
 * Social media links component with dividers.
 * Displays GitHub, LinkedIn, Email, and Instagram icons.
 */
export const Socials = () => (
    <div
        className={css({
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            height: "80%",
        })}
    >
        <div
            className={css({ display: "flex", flexDirection: "column", justifyContent: "center" })}
        >
            <Route href={"https://github.com/becker63"} size={30}>
                <FontAwesomeIcon
                    icon={faGithub}
                    size="2xl"
                    className={css({ _hover: { color: "#575757" } })}
                />
            </Route>
        </div>
        <div
            className={css({
                w: "1px",
                bg: "white",
                float: "left",
                h: "80%",
                alignSelf: "center",
            })}
        />
        <div
            className={css({ display: "flex", flexDirection: "column", justifyContent: "center" })}
        >
            <Route href={"https://www.linkedin.com/in/taylor-johnson-805061210/"} size={30}>
                <FontAwesomeIcon
                    icon={faLinkedin}
                    size="2xl"
                    className={css({ _hover: { color: "#ff63a4" } })}
                />
            </Route>
        </div>
        <div
            className={css({
                w: "1px",
                bg: "white",
                float: "left",
                h: "80%",
                alignSelf: "center",
            })}
        />
        <div
            className={css({ display: "flex", flexDirection: "column", justifyContent: "center" })}
        >
            <Route href={"mailto:johnsontaylor6320@gmail.com"} size={30}>
                <FontAwesomeIcon
                    icon={faEnvelope}
                    size="2xl"
                    className={css({ _hover: { color: "#06c1ff" } })}
                />
            </Route>
        </div>
        <div
            className={css({
                w: "1px",
                bg: "white",
                float: "left",
                h: "80%",
                alignSelf: "center",
            })}
        />
        <div
            className={css({ display: "flex", flexDirection: "column", justifyContent: "center" })}
        >
            <Route href={"https://www.instagram.com/taylorjohnson63200"} size={30}>
                <FontAwesomeIcon
                    icon={faInstagram}
                    size="2xl"
                    className={css({ _hover: { color: "#7301ff" } })}
                />
            </Route>
        </div>
    </div>
);
