import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl = "https://kushal0508.github.io"
const siteName = "Kushal R Portfolio"

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/portfolio`),
  title: {
    default: "Kushal R | Odoo Techno-Functional Intern & Frontend Developer",
    template: "%s | Kushal R",
  },
  description:
    "Personal portfolio of Kushal R, an Odoo Techno-Functional Intern, Frontend Developer, Web Designer, and Freelance Web Developer based in Mysore, India.",
  keywords: [
    "Kushal R",
    "Frontend Developer",
    "Odoo ERP",
    "Odoo Techno-Functional",
    "Web Development",
    "Python",
    "JavaScript",
    "React",
    "Next.js",
    "BCA",
    "Amrita Vishwa Vidyapeetham",
    "Mysore",
  ],
  authors: [{ name: "Kushal R", url: siteUrl }],
  creator: "Kushal R",
  publisher: "Kushal R",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName,
    title: "Kushal R | Odoo Techno-Functional Intern & Frontend Developer",
    description:
      "Personal portfolio of Kushal R, an Odoo Techno-Functional Intern, Frontend Developer, Web Designer, and Freelance Web Developer based in Mysore, India.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Kushal R - Odoo Techno-Functional Intern & Frontend Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kushal0508",
    creator: "@kushal0508",
    title: "Kushal R | Odoo Techno-Functional Intern & Frontend Developer",
    description:
      "Personal portfolio of Kushal R, an Odoo Techno-Functional Intern, Frontend Developer, Web Designer, and Freelance Web Developer based in Mysore, India.",
    images: [`${siteUrl}/portfolio/og-image.png`],
  },
  icons: {
    icon: "/portfolio/favicon.ico",
    shortcut: "/portfolio/favicon-16x16.png",
    apple: "/portfolio/apple-touch-icon.png",
  },
  manifest: `${siteUrl}/portfolio/manifest.webmanifest`,
  alternates: {
    canonical: `${siteUrl}/portfolio`,
    languages: {
      "en-IN": `${siteUrl}/portfolio`,
    },
  },
  category: "technology",
  verification: {
    google: "google-site-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <meta name="theme-color" content="#030305" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
__html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Kushal R",
            givenName: "Kushal",
            familyName: "R",
            jobTitle: "Odoo Techno-Functional Intern & Frontend Developer",
            description:
              "Final-year BCA student passionate about building business-driven digital solutions using Odoo ERP and modern frontend technologies. Focus on ERP customization, responsive web design, and practical business workflows.",
            url: `${siteUrl}/portfolio`,
            email: "kushalshetty0508@gmail.com",
              telephone: "+91-77952-67355",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Mysore",
                addressRegion: "Karnataka",
                addressCountry: "IN",
              },
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "Amrita Vishwa Vidyapeetham",
                sameAs: "https://amrita.edu",
              },
              knowsAbout: [
                "Frontend Development",
                "Odoo ERP",
                "Web Development",
                "JavaScript",
                "TypeScript",
                "Python",
                "React",
                "Next.js",
                "PostgreSQL",
                "Docker",
                "Git",
                "REST APIs",
              ],
              sameAs: [
                "https://github.com/kushal0508",
                "https://www.linkedin.com/in/kushal-r-0256a631b/",
              ],
              worksFor: {
                "@type": "Organization",
                name: "Amcap Business Consulting Pvt Ltd",
                description: "Odoo Business Consulting Firm",
              },
              hasCredential: {
                "@type": "EducationalOccupationalCredential",
                name: "Bachelor of Computer Applications (BCA)",
                educationalLevel: "Bachelor's Degree",
                recognizedBy: {
                  "@type": "CollegeOrUniversity",
                  name: "Amrita Vishwa Vidyapeetham",
                },
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}