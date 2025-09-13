"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
function useDockItemSize(mouseX, baseItemSize, magnification, distance, ref, spring) {
    const mouseDistance = useTransform(mouseX, (val) => {
        if (typeof val !== "number" || isNaN(val))
            return 0;
        const rect = ref.current?.getBoundingClientRect() ?? {
            x: 0,
            width: baseItemSize,
        };
        return val - rect.x - baseItemSize / 2;
    });
    const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
    return useSpring(targetSize, spring);
}
function DockItem({ icon, label, onClick, mouseX, baseItemSize, magnification, distance, spring, badgeCount, }) {
    const ref = useRef(null);
    const isHovered = useMotionValue(0);
    const size = useDockItemSize(mouseX, baseItemSize, magnification, distance, ref, spring);
    const [showLabel, setShowLabel] = useState(false);
    useEffect(() => {
        const unsubscribe = isHovered.on("change", (value) => setShowLabel(value === 1));
        return () => unsubscribe();
    }, [isHovered]);
    return (_jsxs(motion.div, { ref: ref, style: { width: size, height: size }, onHoverStart: () => isHovered.set(1), onHoverEnd: () => isHovered.set(0), onFocus: () => isHovered.set(1), onBlur: () => isHovered.set(0), onClick: onClick, className: "relative inline-flex items-center justify-center rounded-full \r\n      bg-background    shadow-md  ", tabIndex: 0, role: "button", "aria-haspopup": "true", children: [_jsx("div", { className: "flex items-center justify-center", children: icon }), badgeCount !== undefined && badgeCount > 0 && (_jsx("span", { className: "absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full", children: badgeCount > 99 ? "99+" : badgeCount })), _jsx(AnimatePresence, { children: showLabel && (_jsx(motion.div, { initial: { opacity: 0, y: 0 }, animate: { opacity: 1, y: -10 }, exit: { opacity: 0, y: 0 }, transition: { duration: 0.2 }, className: "absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md \r\n            border border   bg-[#060606] px-2 py-0.5 text-xs text-white", style: { x: "-50%" }, role: "tooltip", children: label })) })] }));
}
export default function Dock({ items, className = "", spring = { mass: 0.1, stiffness: 150, damping: 12 }, magnification = 70, distance = 200, panelHeight = 64, dockHeight = 256, baseItemSize = 50, }) {
    const mouseX = useMotionValue(Infinity);
    const isHovered = useMotionValue(0);
    const maxHeight = useMemo(() => Math.max(dockHeight, magnification + magnification / 2 + 4), [magnification, dockHeight]);
    const animatedHeight = useSpring(useTransform(isHovered, [0, 1], [panelHeight, maxHeight]), spring);
    return (_jsx(motion.div, { style: { height: animatedHeight }, className: "mx-2 flex max-w-full items-center", children: _jsx(motion.div, { onMouseMove: ({ pageX }) => {
                isHovered.set(1);
                mouseX.set(pageX);
            }, onMouseLeave: () => {
                isHovered.set(0);
                mouseX.set(Infinity);
            }, className: `absolute bottom-2 left-1/2 -translate-x-1/2 transform 
            flex items-end gap-4 w-fit rounded-2xl 
            border-2 border   px-4 pb-2 ${className}`, style: { height: panelHeight }, role: "toolbar", "aria-label": "Application dock", children: items.map((item, index) => (_jsx(DockItem, { icon: item.icon, label: item.label, onClick: item.onClick, mouseX: mouseX, baseItemSize: baseItemSize, magnification: magnification, distance: distance, spring: spring, badgeCount: item.badgeCount }, index))) }) }));
}
