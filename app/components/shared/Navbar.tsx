"use client";

import { css } from "../../../styled-system/css";
import "./shared.css";
import { Route } from "./Route";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBookOpen,
  faDiagramProject,
} from "@fortawesome/free-solid-svg-icons";

export interface NavbarProps {
  mode?: "fixed" | "sticky";
}

export const Navbar = ({ mode = "fixed" }: NavbarProps) => {
  return (
    <nav
      className={css({
        layerStyle: "navbar",
        position: mode,
        backdropFilter: "blur(10px)",
      })}
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mx: "auto",
          w: "100%",
          maxW: "1536px",
        })}
      >
        {/* Logo */}
        <a href="/" className={css({ display: "flex" })}>
          <span
            className={`anim-typewriter ${css({
              alignSelf: "center",
              fontSize: "30px",
              fontWeight: "semibold",
              whiteSpace: "nowrap",
              color: "white",
              fontFamily: "pixel, sans-serif",
              letterSpacing: "0.04em",
              textShadow: "0 0 4px rgba(255,255,255,0.25)",
            })}`}
          >
            becker63
          </span>
        </a>

        {/* Links */}
        <ul
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "3",
          })}
        >
          <li>
            <Route
              color="#0097fc"
              href="/"
              size={18}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "2",
                py: "1",
                px: "2",
                fontSize: "14px",
                borderBottom: "1px solid transparent",
                transition: "all 0.15s ease",
                _hover: {
                  borderColor: "#0097fc",
                  textShadow: "0 0 6px rgba(0,151,252,0.6)",
                },
              })}
            >
              <FontAwesomeIcon icon={faHouse} />
              <span>Home</span>
            </Route>
          </li>

          <li>
            <Route
              color="#FCA5A5"
              href="/Search"
              size={18}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "2",
                py: "1",
                px: "2",
                fontSize: "14px",
                borderBottom: "1px solid transparent",
                transition: "all 0.15s ease",
                _hover: {
                  borderColor: "#FCA5A5",
                  textShadow: "0 0 6px rgba(252,165,165,0.6)",
                },
              })}
            >
              <FontAwesomeIcon icon={faBookOpen} />
              <span>Blogs</span>
            </Route>
          </li>

          <li>
            <Route
              color="#86EFAC"
              href="/Blogs/designing-for-two"
              size={18}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "2",
                py: "1",
                px: "2",
                fontSize: "14px",
                borderBottom: "1px solid transparent",
                transition: "all 0.15s ease",
                _hover: {
                  borderColor: "#86EFAC",
                  textShadow: "0 0 6px rgba(134,239,172,0.6)",
                },
              })}
            >
              <FontAwesomeIcon icon={faDiagramProject} />
              <span>Portfolio</span>
            </Route>
          </li>
        </ul>
      </div>
    </nav>
  );
};
