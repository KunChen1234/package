interface Prop {
    warningIsVisible: boolean;
    warning: string;
    close: () => void;
}
function Waring_AlreadyLogin(props: Prop) {
    return (
        
        <div className={`${props.warningIsVisible ? "visible" : "invisible"}  text-red-500  text-center  bg-white absolute w-[200px] h-[100px]  left-1/2  top-1/2
        translate-x-[-50%]  translate-y-[-50%]  border-4  border-red-500` }>
            <p >{props.warning}</p>
            <button className='absolute bottom-0 left-1/2 translate-x-[-50%] translate-y-[-50%] ' onClick={props.close}>Close</button>
        </div>
    )

}
export default Waring_AlreadyLogin;