import { Navbar } from "../../components/shared/Navbar";
import { BlogNavbarWrapper } from "../../components/blog/BlogNavbarWrapper";
import { css } from "../../../styled-system/css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={css({ px: "layout", pt: "layout" })}>
      <BlogNavbarWrapper>
        <Navbar mode="sticky" />
      </BlogNavbarWrapper>
      {children}
    </div>
  )
}