import Header from "@/components/Header";
import EvaluatieFormulier from "@/components/EvaluatieFormulier";
import Footer from "@/components/Footer";

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function getEventDates(): { label: string; iso: string }[] {
  const raw = process.env.EVENT_DATES ?? "";
  if (!raw.trim()) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((iso) => {
      const date = new Date(iso + "T00:00:00");
      return { iso, date };
    })
    .filter(({ date }) => !isNaN(date.getTime()) && date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ iso, date }) => ({ label: dateFormatter.format(date), iso }));
}

export default function Home() {
  const eventDates = getEventDates();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <EvaluatieFormulier dates={eventDates} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
