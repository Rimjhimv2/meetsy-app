
// }

// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
// } from "@clerk/nextjs";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Trophy } from "lucide-react";

// export default function Header() {
//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
//       <div className="layout-container flex justify-between items-center">
        
//         {/* Left side: logo + nav */}
//         <div className="flex items-center gap-6">
//           <Link href="/" className="font-bold text-xl">
//             Meetsy
//           </Link>

//           <SignedIn>
//             <nav className="hidden md:flex items-center gap-6">
//               <Link href="/dashboard">Dashboard</Link>
//               <Link href="/communities">Communities</Link>
//               <Link href="/chat">Chat</Link>
//             </nav>
//           </SignedIn>
//         </div>

//         {/* Right side: auth buttons / user menu */}
//         <div className="flex items-center gap-4">

//           {/* Pro badge only when signed in */}
//           <SignedIn>
//             <Badge variant="outline" className="flex items-center gap-1">
//               <Trophy className="size-3 text-primary" />
//               <span>Pro</span>
//             </Badge>
//           </SignedIn>

//           <SignedOut>
//             <SignInButton>
//               <Button>Sign In</Button>
//             </SignInButton>

//             <SignUpButton>
//               <Button variant="outline">Sign Up</Button>
//             </SignUpButton>
//           </SignedOut>

//           <SignedIn>
//             <UserButton />
//           </SignedIn>

//         </div>
//       </div>
//     </header>
//   );
// }




// "use client";

// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
//   useUser,
// } from "@clerk/nextjs";
// import { MessageCircleIcon, UsersIcon } from "lucide-react";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Trophy } from "lucide-react";

// export default function Header() {
//   const { isSignedIn } = useUser();
//   const isPro = true; // later DB se aayega

//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
//       <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">

//         {/* Left side */}
//         <div className="flex items-center gap-8">
//           <Link href="/" className="font-bold text-xl">
//             Meetsy
//           </Link>

//           <SignedIn>
//             <nav className="flex items-center gap-6">
//               <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
//                 Dashboard
//               </Link>
//               {/* <Link href="/communities" className="text-sm font-medium hover:text-primary">
//               <UsersIcon className="size-4 text-primary"/>
//                 Communities
//               </Link> */}

              

// <Link
//   href="/communities"
//   className="flex items-center gap-2 text-sm font-medium hover:text-primary"
// >
//   <UsersIcon className="size-4 text-primary" />
//   <span>Communities</span>
// </Link>

              

// <Link
//   href="/chat"
//   className="flex items-center gap-2 text-sm font-medium hover:text-primary"
// >
//   <MessageCircleIcon className="size-4 text-primary" />
//   <span>Chat</span>
// </Link>

//             </nav>
//           </SignedIn>
//         </div>

//         {/* Right side */}
//         <div className="flex items-center gap-4">

//           {/* Pro / Free badge */}
//           {isSignedIn && (
//             isPro ? (
//               <Badge variant="outline" className="flex items-center gap-2">
//                 <Trophy className="size-3 text-primary" />
//                 <span>Pro</span>
//               </Badge>
//             ) : (
//               <Badge variant="secondary">Free</Badge>
//             )
//           )}

//           <SignedOut>
//             <Link href = "/sign-in">
//             <Button varinat = "ghost" size = {"sm"}>
//               Sign in </Button></Link>
//               <Link href="/sign-up">
//               <Button variant = "ghost" size="sm"
// ></Button></Link>       <SignInButton asChild>
//               <Button variant="ghost">Sign In</Button>
//             </SignInButton>

//             <SignUpButton asChild>
//               <Button>Sign Up</Button>
//             </SignUpButton>
//           </SignedOut>

//           <SignedIn>
//             <UserButton
//               afterSignOutUrl="/"
//               appearance={{
//                 elements: {
//                   avatarBox: "size-9",
//                 },
//               }}
//             />
//           </SignedIn>

//         </div>
//       </div>
//     </header>
//   );
// }




// 

"use client";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { MessageCircleIcon, TrophyIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

export default function Header({ isPro }: { isPro: boolean }) {
  const { isSignedIn } = useUser();

  return (
    <header>
      <div className="layout-container">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl space-x-2">
            Meetsy
          </Link>

          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant={"ghost"} size={"sm"}>
                  Dashboard
                </Button>
              </Link>
              <Link href="/communities">
                <Button variant={"ghost"} size={"sm"}>
                  <UsersIcon className="size-4 text-primary" />
                  Communities
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant={"ghost"} size={"sm"}>
                  <MessageCircleIcon className="size-4 text-primary" />
                  Chat
                </Button>
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              {isPro ? (
                <Badge className="flex items-center gap-2" variant="outline">
                  <TrophyIcon className="size-3 text-primary" /> Pro
                </Badge>
              ) : (
                "Free"
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-9",
                  },
                }}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size={"sm"}>
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}