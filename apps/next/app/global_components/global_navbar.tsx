//import { Hamburg, Logo } from "../extras/svg/svgs";
import "./global_components.css";
import { Route } from "./client/linkwithloading";

export const Navbar = () => {
  return (
    <nav
      className="sticky z-50 bg-black px-2 sm:px-4
    top-2 mx-2 opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] mb-5"
    >
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <a href="#" className="flex">
          <span className="self-center text-[30px] font-semibold whitespace-nowrap dark:text-white anim-typewriter font-[pixel]">
            becker63
          </span>
        </a>

          <ul className="flex">
            <li>
              <Route color="#0097fc" href="/" className="block py-2  sm:px-4 px-1 pl-3 text-[15px]" size={20}>
                <h3 className="hover:text-white">Home</h3>
              </Route>
            </li>
            <li>
              <Route color="#FCA5A5" href="/Search" className="block py-2  sm:px-4 px-1 pl-3 text-[15px]" size={20}>
              <h3 className="hover:text-white">Blogs</h3>
              </Route>
            </li>
            <li>
              <Route color="#86EFAC" href="#" className="block py-2  sm:px-4 px-1 pl-3 text-[15px]" size={20}>
              <h3 className="hover:text-white">Portfolio</h3>
              </Route>
            </li>
          </ul>
      </div>
    </nav>
  );
};
