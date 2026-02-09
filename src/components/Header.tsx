import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b border-border py-6 px-4">
      <div className="max-w-2xl mx-auto flex justify-center">
        <Image
          src="/b2b-logo.png"
          alt="B2B Twente - resultaatgericht netwerken"
          width={209}
          height={49}
          priority
        />
      </div>
    </header>
  );
}
