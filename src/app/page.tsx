import Header from "@/components/Header";
import EvaluatieFormulier from "@/components/EvaluatieFormulier";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <EvaluatieFormulier />
        </div>
      </main>

      <Footer />
    </div>
  );
}
