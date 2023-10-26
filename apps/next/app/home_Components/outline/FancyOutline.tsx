import * as React from "react";
import { Ref, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const useDivProps = (
  boxRef: React.RefObject<HTMLDivElement>,
  callback?:
    | ((arg0: { x: number; y: number; h: number; w: number }) => void)
    | undefined
) => {
  const [DivProps, setDivProps] = useState({ x: 0, y: 0, h: 0, w: 0 });

  // This function calculate X and Y
  const getPosition = () => {
    if (boxRef.current) {
      setDivProps({
        x: boxRef.current.offsetLeft,
        y: boxRef.current.offsetTop,
        h: boxRef.current.clientHeight,
        w: boxRef.current.clientWidth,
      });
    }
  };

  // Get the position of the red box in the beginning
  useEffect(() => {
    getPosition();
  }, []);

  // Re-calculate X and Y of the red box when the window is resized by the user
  useEffect(() => {
    window.addEventListener("resize", getPosition);
  }, []);

  if (callback) callback(DivProps);

  return DivProps;
};

type Props = {
  children?: React.ReactNode;
  input?: boolean | undefined;
};

export const FancyOutline = ({ children }: Props) => {

  const boxRef = React.useRef<HTMLDivElement>(null)
  const boxProps = useDivProps(boxRef);

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = i * 0.1;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
          opacity: { delay, duration: 0.01 },
        },
      };
    },
  };
  const padding = "30px"

  useEffect(() => {
    console.log(boxProps)
    console.log(boxRef?.current?.getBoundingClientRect())
  }, [boxProps])

  return (
    <>
      <div>
        <motion.svg
          height={boxProps.h.toString() + "px"}
          width={boxProps.w.toString() + "px"}
          initial="hidden"
          animate="visible"
        >
          <motion.line
            x1="0"
            y1="0"
            x2={boxProps.w.toString()}
            y2="0"
            stroke="#1c1c1c"
            variants={draw}
            strokeWidth={3}
            custom={1}
          />
          <motion.line
            x1={boxProps.w.toString()}
            y1="0"
            x2={boxProps.w.toString()}
            y2={boxProps.h.toString()}
            stroke="#1c1c1c"
            variants={draw}
            strokeWidth={3}
            custom={1}
          />
          <motion.line
            x1={boxProps.w.toString()}
            y1={boxProps.h.toString()}
            x2="0"
            y2={boxProps.h.toString()}
            stroke="#1c1c1c"
            variants={draw}
            strokeWidth={3}
            custom={1}
          />
          <motion.line
            x1="0"
            y1={boxProps.h.toString()}
            x2="0"
            y2="0"
            stroke="#1c1c1c"
            variants={draw}
            strokeWidth={3}
            custom={1}
          />
          <motion.foreignObject width="100" height="100">
            <div ref={boxRef}>{children}</div>
          </motion.foreignObject>
        </motion.svg>
      </div>
    </>
  );
};
