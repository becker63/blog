import { Navbar } from "../../components/shared/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar mode="sticky" />
      <div>{children}</div>
    </>
  )
}