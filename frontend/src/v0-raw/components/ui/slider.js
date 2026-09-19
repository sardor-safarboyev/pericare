import { cn } from "@/lib/utils";
export function Slider({ className, ...props }) {
    return (<input type="range" className={cn("h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary outline-none", className)} {...props}/>);
}
