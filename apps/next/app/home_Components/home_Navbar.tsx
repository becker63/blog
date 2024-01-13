'use client'
import { useEffect, useState } from 'react'

export const HomeNav = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY != 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <nav
      className="sticky z-50 bg-black px-2 sm:px-4 opacity-70 shadow-[#00000F_0_0_10px] mb-1 transition-[top,margin] duration-[1s] ease-[ease] delay-[0s]"
      style={
        isScrolled
          ? {
              marginLeft: '0px',
              marginRight: '0px',
              top: '0px',
              opacity: '0.9',
              borderBottomLeftRadius: '10px',
              borderBottomRightRadius: '10px'
            }
          : { marginLeft: '12px', marginRight: '12px', top: '12px', borderRadius: '10px' }
      }
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
  )
}
