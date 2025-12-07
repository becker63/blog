'use client';
import { motion } from "framer-motion";
import SVG from 'react-inlinesvg';
import { css } from "../../styled-system/css";

export const Bebop = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            className={css({
                position: 'absolute',
                top: 0,
                left: 0,
                w: '100%',
                h: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            })}
        >
            <SVG
                src="/svg/bebop.svg"
                width="100%"
                height="100%"
                style={{ width: '100%', height: '100%', display: 'block' }}
                preserveAspectRatio="xMidYMid meet"
                className={css({
                    w: '100%',
                    h: '100%',
                    display: 'block'
                })}
            />
        </motion.div >
    );
};
