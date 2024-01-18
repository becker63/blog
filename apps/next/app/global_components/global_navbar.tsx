'use client'
//import { Hamburg, Logo } from "../extras/svg/svgs";
import './global_components.css'
import { Route } from './client/linkwithloading'
import { useEffect, useState } from 'react'
import { disableBodyScroll, enableBodyScroll} from 'body-scroll-lock';
import { SettingsEditor } from './global_settings';
 
export const Navbar = () => {
  const [displaySettings, setDsiplaySettings] = useState(true)
  // when scrolled use a less obstrusive version of navbar
  const [LessNav, setLessNav] = useState(false)

  // show or hide navbar when scroll
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true)

  useEffect(() => {

      if(displaySettings){
        document.documentElement.style.setProperty('--settings_show', 'false')
        setLessNav(false)
        disableBodyScroll(document.body)
      }
      else{
        document.documentElement.style.setProperty('--settings_show', 'true')
        enableBodyScroll(document.body)
      }
      
  }, [displaySettings])

  useEffect(() => {
    console.log("test")
    if (window.scrollY != 0) {
      setLessNav(true)
    } else {
      setLessNav(false)
    }

    const handleScroll = () => {
      const currentScrollPos = window.scrollY
      if (window.scrollY != 0) {
        setLessNav(true)
      } else {
        setLessNav(false)
      }

    if(prevScrollPos - currentScrollPos < 0){
        setVisible(false)
    }else if(prevScrollPos - currentScrollPos > 0){
        setVisible(true)
    }

    setPrevScrollPos(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [prevScrollPos])

  useEffect(() => {
    console.log({
      displaySettings: displaySettings,
      LessNav: LessNav,
      prevScrollPos: prevScrollPos,
      currentScrollPos: window.scrollY,
      combinedScrollPos: prevScrollPos - window.scrollY,
    })
  }, [displaySettings, LessNav, prevScrollPos])

  return (
    <>
      <nav
        className="z-50 bg-black px-2 px-4 shadow-[#00000F_0_0_10px] mb-6 transition-[top,margin] duration-[1s] ease-[ease] delay-[0s]"
        style={
          LessNav
            ? {
                top: visible ? '0px' : '-80px',
                transition: 'top 1s ease-out',
                opacity: '0.9',
                position: 'fixed',
                width: '100vw',
                marginLeft: '0px',
                marginRight: '0px',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px'
              }
            : {
                opacity: '0.7',
                position: 'sticky',
                marginLeft: '12px',
                marginRight: '12px',
                top: '12px',
                borderRadius: '10px'
              }
        }
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
            <li>
              <button onClick={() => setDsiplaySettings(!displaySettings)}>test</button>
            </li>
          </ul>
        </div>
      </nav>
      <div
        className="z-50 opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] bg-[#000000] mx-12 md:w-[640px] md:mx-auto p-6 my-5"
        style={{
          height: 'calc(100vh - 80px)',
          position: 'relative',
          display: displaySettings ? 'flex' : 'none'
        }}
      >
        <SettingsEditor />
      </div>
    </>
  )
}
