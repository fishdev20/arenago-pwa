import { ReactNode } from "react";

export default function PageWrapper({children}: {children: ReactNode}) {
    return (
        <div className="py-6 px-4">
            {children}
        </div>
    )
}
