import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border py-8 px-4 mt-auto">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
        {/* Footer logo */}
        <Image
          src="/b2b-logo-footer.png"
          alt="B2B Twente"
          width={42}
          height={48}
        />

        {/* B2B Twente contact info */}
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-text-muted text-sm">
          <span>I: www.b2btwente.nl</span>
          <span className="hidden sm:inline">|</span>
          <span>E: info@b2btwente.nl</span>
          <span className="hidden sm:inline">|</span>
          <span>Rekeningnummer NL43 RABO 0171 694 325</span>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-border" />

        {/* RocketFlow badge */}
        <a
          href="https://rocketflow.nl/twente"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-light text-xs hover:text-text-muted transition-colors"
        >
          Gebouwd met 💪 in Twente
        </a>
      </div>
    </footer>
  );
}
