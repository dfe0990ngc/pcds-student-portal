interface LoadingProps {
    flg: boolean;
    text: string;
    processingText: string;
    spinWidth: number;
}
const Loading = ({flg, text, processingText, spinWidth = 5}: LoadingProps) => {
    
    if(flg){
        return <>
            <i className={`block border-0 border-white border-b-2 rounded-full w-${spinWidth} h-${spinWidth} animate-spin`}></i>&nbsp;{processingText}
        </>
    }

    return <span>{text}</span>
}

export default Loading;