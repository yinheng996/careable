import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId, sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  // Determine the "Get Started" destination
  let getStartedHref = "/sign-up";
  if (userId) {
    getStartedHref = role ? `/${role}/dashboard` : "/onboarding";
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF9] font-sans text-[#4A3728]">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-block px-4 py-1.5 bg-[#FEF3EB] rounded-full text-sm font-bold text-[#E89D71] mb-4">
            Welcome to Careable
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#2D1E17] leading-[1.1]">
            Empowering Every Child, <br />
            <span className="text-[#E89D71]">Supporting Every Caregiver.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#6B5A4E] max-w-2xl mx-auto leading-relaxed">
            A centralized platform for managing events, volunteering, and support for children with disabilities. 
            Join our community of care today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href={getStartedHref}
              className="w-full sm:w-auto px-8 py-4 bg-[#E89D71] text-white rounded-2xl font-bold text-lg hover:bg-[#D88C61] transition-all transform hover:scale-105 shadow-lg shadow-[#E89D71]/20"
            >
              Get Started
            </Link>
            <Link 
              href="/about"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#4A3728] border-2 border-zinc-100 rounded-2xl font-bold text-lg hover:bg-zinc-50 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-zinc-100 text-center text-sm text-[#6B5A4E]">
        © {new Date().getFullYear()} Careable. Built with love for the community.
      </footer>
    </div>
  );
}
