


// import { ClerkProvider,
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton
//  } from "@clerk/nextjs";
//  import Link from "next/link";


//  import {Button} from "@/components/ui/button";
// export default function Header() {
//   return (
//     <header >
//         <div className="layout-container">
//             <div className = "flex items-center gap-6">

//                 <Link href = "/" className = "font-bold text-xl">
//                 Meetsy</Link>
//                 <SignedIn>
//                     <nav className = "hidden md:flex items-center gap-6">
//                         <Link href = "/dashboard" >Dashboard</Link>
//                          <Link href = "/communities" >Communities</Link>
//                           <Link href = "/chat" >Chat</Link>
//                     </nav>

//                 </SignedIn>

//             </div>
//     <SignedOut>
//         <SignInButton/>
//         <SignUpButton>
//         <Button>Sign Up</Button>
//         </SignUpButton>

//     </SignedOut>

//     <SignedIn>
//         <UserButton/>
//     </SignedIn>
//     </div>
//     </header>
//   );
// }

import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton 
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="layout-container flex justify-between items-center">
        {/* Left side: logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Meetsy
          </Link>

          <SignedIn>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/communities">Communities</Link>
              <Link href="/chat">Chat</Link>
            </nav>
          </SignedIn>
        </div>

        {/* Right side: auth buttons / user menu */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
