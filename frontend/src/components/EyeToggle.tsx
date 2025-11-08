import { Eye, EyeOff } from "lucide-react";

interface EyeToggleProps {
    flg: boolean;
    setToggle: (flg: boolean) => void;
}

const EyeToggle = ({flg, setToggle}: EyeToggleProps) => {
    return flg ? 
    (<EyeOff onClick={() => setToggle(false)} className="top-1/2 right-3 z-10 absolute w-5 h-5 text-gray-400 -translate-y-1/2 cursor-pointer transform" />) :
    (<Eye onClick={() => setToggle(true)} className="top-1/2 right-3 z-10 absolute w-5 h-5 text-gray-400 -translate-y-1/2 cursor-pointer transform" />);
}

export default EyeToggle;