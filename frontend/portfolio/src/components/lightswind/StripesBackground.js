import { jsx as _jsx } from "react/jsx-runtime";
import clsx from "clsx";
const StripedBackground = ({ className, position = "right", width = "w-full", height = "h-full", opacity = "opacity-70", // This opacity applies to the div itself
 }) => {
    const positionStyles = {
        right: "absolute top-0 right-0",
        left: "absolute top-0 left-0",
        top: "absolute top-0 left-0 w-full h-32",
        bottom: "absolute bottom-0 left-0 w-full h-32",
        full: "absolute inset-0",
    };
    return (_jsx("div", { className: clsx("pointer-events-none", 
        // More visible stripes in both modes
        "bg-[repeating-linear-gradient(45deg,_#00000066_0px,_#00000066_1px,_transparent_1px,_transparent_6px)] opacity-50", "dark:bg-[repeating-linear-gradient(45deg,_#ffffff66_0px,_#ffffff66_1px,_transparent_1px,_transparent_6px)]", positionStyles[position], width, height, className // now `opacity-50` will apply more obviously
        ) }));
};
export default StripedBackground;
