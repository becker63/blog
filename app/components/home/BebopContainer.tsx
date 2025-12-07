import { css } from "../../../styled-system/css";
import { Bebop } from "./Bebop";

/**
 * Container component for the Bebop SVG on desktop layout.
 * Centers the SVG and adds the "see ya space cowboy" tagline.
 */
export const BebopContainer = () => {
    return (
        <div
            className={css({
                lg: { w: "100%" },
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                alignContent: "center",
                justifyContent: "center",
                h: "100%",
                overflow: "hidden",
            })}
        >
            <div className={css({
                position: "relative",
                w: "100%",
                h: "100%",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                alignItems: "center",
                justifyContent: "center"
            })}>
                <Bebop />
            </div>
            <p className={css({ pr: "16", textAlign: "right" })}>
                see ya space cowboy...
            </p>
        </div>
    );
};
