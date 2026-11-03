import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#282521] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#B75D42]/10 flex items-center justify-center mb-6 text-[#B75D42] font-serif font-bold text-2xl">
        404
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3 text-[#282521]">
        Page Not Found
      </h1>
      <p className="text-[#6B6357] max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        The agreement or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#B75D42] text-white font-medium hover:bg-[#A34E35] transition-colors shadow-sm"
      >
        Return to Home
      </Link>
    </div>
  )
}

