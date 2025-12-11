import Image from "next/image"
import Link from "next/link"

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className=' bg-muted flex min-h-svh items-center flex-col justify-center gap-6 p-6 md:p-18'>
            <div className='flex w-full max-w-sm flex-col gap-6 mx-auto'>
                <Link href={"/"} className='flex items-center gap-2 font-medium self-center'>
                    <Image
                        alt='logo'
                        src={"/logos/logo.svg"}
                        width={30}
                        height={30}
                    /> Rheoma
                </Link>
            </div>
            {children}
        </div>
    )
}