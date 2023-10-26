import { Navbar } from "../../global_components/global_navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
    <Navbar/>
      <div>{children}</div>
    </>
  )
}