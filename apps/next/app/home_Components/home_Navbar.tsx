export const HomeNav = () => {
  return (
    <nav
      className="sticky z-50 bg-[#000000] px-2 sm:px-4 opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] top-2 mx-2 my-[15px]"
    >
      <div className="container flex flex-wrap justify-center items-center mx-auto">
        {/* home view */}
        <div className="flex">
          <span className="self-center text-[30px] font-semibold whitespace-nowrap dark:text-white anim-typewriter font-[pixel]">
            becker63
          </span>
        </div>
      </div>
    </nav>
  );
};