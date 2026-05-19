import { HomeMobileLayout } from "./components/home/HomeMobileLayout";
import { HomeDesktopLayout } from "./components/home/HomeDesktopLayout";

export default function Home() {
  return (
    <>
      <HomeMobileLayout />
      <HomeDesktopLayout />
    </>
  );
}
