import MyLogo from '../assets/logo.webp';

interface LogoProps {
    className: string;
}
const Logo = ({className = 'w-10 h-10'}: LogoProps) => {
    return (
        <img src={MyLogo} alt="Logo" className={`${className}`} />
    );
}

export default Logo;