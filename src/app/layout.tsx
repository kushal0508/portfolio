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

const siteUrl = "https://kushal0508.github.io/portfolio"
const siteName = "Kushal R Portfolio"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: `${siteUrl}/manifest.webmanifest`,
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-IN": siteUrl,
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
      style={{ background: "#08080f", height: "100%", colorScheme: "dark" }}
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var d=document,h=d.documentElement;h.style.cssText='background:#08080f!important;height:100%;color-scheme:dark';var s=d.createElement('style');s.textContent='html,body{background:#08080f!important;height:100%;color-scheme:dark}body{min-height:100dvh!important}';d.head.insertBefore(s,d.head.firstChild);var e=d.createElement('div');e.id='__anti_flash';e.style.cssText='position:fixed;inset:0;background:#08080f;z-index:999999;pointer-events:none';h.appendChild(e);function m(n,c,md){var t=d.createElement('meta');t.name=n;t.content=c;if(md)t.media=md;d.head.insertBefore(t,d.head.firstChild)}m('theme-color','#08080f','(prefers-color-scheme: dark)');m('theme-color','#08080f','(prefers-color-scheme: light)');m('apple-mobile-web-app-capable','yes');m('apple-mobile-web-app-status-bar-style','black-translucent');setTimeout(function(){var el=d.getElementById('__anti_flash');if(el)el.remove()},5000);})();`,
        }} />
        <style>{`
          html,body{background:#08080f!important;margin:0;padding:0;color-scheme:dark!important;height:100%}
          body{min-height:100dvh!important}
          ::view-transition-old,::view-transition-new{background:#08080f!important}
          @view-transition{navigation:auto}
        `}</style>
        <meta name="theme-color" content="#08080f" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#08080f" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
              url: siteUrl,
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
      <body className="min-h-full bg-background text-foreground" style={{ background: "#08080f", minHeight: "100dvh" }}>
        {children}
      </body>
    </html>
  )
}