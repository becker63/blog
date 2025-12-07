import { css } from "../../../styled-system/css";
import "./shared.css";
import { Route } from "./Route";

export interface NavbarProps {
    mode?: "fixed" | "sticky";
}

/**
 * Global navigation bar component with glass effect styling.
 * Displays the site title and navigation links.
 */
export const Navbar = ({ mode = "fixed" }: NavbarProps) => {
    return (
        <nav
            className={css({
                layerStyle: "navbar",
                position: mode,
            })}
        >
            <div
                className={css({
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mx: "auto",
                    w: "100%",
                    maxW: "1536px",
                })}
            >
                <a href="#" className={css({ display: "flex" })}>
                    <span
                        className={`anim-typewriter ${css({
                            alignSelf: "center",
                            fontSize: "30px",
                            fontWeight: "semibold",
                            whiteSpace: "nowrap",
                            color: "white",
                            fontFamily: "pixel, sans-serif",
                        })}`}
                    >
                        becker63
                    </span>
                </a>

                <ul className={css({ display: "flex" })}>
                    <li>
                        <Route
                            color="#0097fc"
                            href="/"
                            className={css({
                                display: "block",
                                py: "2",
                                px: { base: "1", sm: "4" },
                                pl: "3",
                                fontSize: "15px",
                            })}
                            size={20}
                        >
                            <h3 className={css({ _hover: { color: "white" } })}>Home</h3>
                        </Route>
                    </li>
                    <li>
                        <Route
                            color="#FCA5A5"
                            href="/Search"
                            className={css({
                                display: "block",
                                py: "2",
                                px: { base: "1", sm: "4" },
                                pl: "3",
                                fontSize: "15px",
                            })}
                            size={20}
                        >
                            <h3 className={css({ _hover: { color: "white" } })}>Blogs</h3>
                        </Route>
                    </li>
                    <li>
                        <Route
                            color="#86EFAC"
                            href="#"
                            className={css({
                                display: "block",
                                py: "2",
                                px: { base: "1", sm: "4" },
                                pl: "3",
                                fontSize: "15px",
                            })}
                            size={20}
                        >
                            <h3 className={css({ _hover: { color: "white" } })}>Portfolio</h3>
                        </Route>
                    </li>
                </ul>
            </div>
        </nav>
    );
};
