import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
 } from "@clerk/nextjs";
 import { Button } from "@/components/ui/button"; // I notice you want to use Button inside SignUpButton


const outfitFont = Outfit({
  
  subsets: ["latin"],
  weight:["100","200","300","400","500","600","700","800","900"],
});



export const metadata: Metadata = {
  title: "Meetsy",
  description: "Meetsy is a ai learning platform that helps you learn new skills quickly and easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${outfitFont.className} antialiased`}
      >
        <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <Button>  Sign Up</Button>
                
                
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
