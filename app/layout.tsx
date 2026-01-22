// import type { Metadata } from "next";
// import { Outfit } from "next/font/google";
// import "./globals.css";
// import { ClerkProvider,
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton
//  } from "@clerk/nextjs";
//  import { Button } from "@/components/ui/button"; // I notice you want to use Button inside SignUpButton


// const outfitFont = Outfit({
  
//   subsets: ["latin"],
//   weight:["100","200","300","400","500","600","700","800","900"],
// });



// export const metadata: Metadata = {
//   title: "Meetsy",
//   description: "Meetsy is a ai learning platform that helps you learn new skills quickly and easily.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <ClerkProvider>
//     <html lang="en">
//       <body
//         className={`${outfitFont.className} antialiased`}
//       >
       
//         {children}
//       </body>
//     </html>
//     </ClerkProvider>
//   );
// }


import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/layout/header-wrapper";
import Footer from "@/components/layout/footer";

const outfitFont = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});


  
export const metadata: Metadata = {
  title: "Meetsy",
  description:
    "Meetsy is a ai learning platform to connect with other learners in the community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfitFont.className} antialiased`}>
          
           <HeaderWrapper/>
            {children}
           <Footer/>
           
          
         
        </body>
      </html>
    </ClerkProvider>
  );
}