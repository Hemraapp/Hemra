import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Cookies"
};

export default function CookiesPage() {
  return (
    <InfoPage
      title="Cookies"
      intro="Denne siden forklarer hvordan Hemra kan bruke Cookies for å få nettstedet til å fungere og forstå hvordan tjenesten brukes."
    >
      <InfoSection title="Hva er Cookies?">
        <p>Cookies er små tekstfiler som kan lagres i nettleseren når du besøker et nettsted.</p>
      </InfoSection>

      <InfoSection title="Hvordan Hemra kan bruke Cookies">
        <h3 className="text-base font-semibold text-stone-950">Nødvendige Cookies</h3>
        <p>Brukes for at nettstedet skal fungere teknisk.</p>
        <h3 className="pt-2 text-base font-semibold text-stone-950">Analysecookies</h3>
        <p>Kan brukes for å forstå trafikk og bruksmønstre, for eksempel:</p>
        <InfoList items={["sidevisninger", "populære sider", "enhetstyper"]} />
        <h3 className="pt-2 text-base font-semibold text-stone-950">Preferansecookies</h3>
        <p>Kan brukes for å huske valg, dersom slike funksjoner tilbys senere.</p>
      </InfoSection>

      <InfoSection title="Samtykke">
        <p>Dersom Hemra bruker Cookies som krever samtykke, skal brukeren få mulighet til å godta eller avslå dette.</p>
      </InfoSection>

      <InfoSection title="Hvordan endre valg">
        <p>Du kan endre innstillinger for Cookies i nettleseren. Dersom Hemra senere bruker et samtykkebanner, skal du også kunne trekke samtykket tilbake der.</p>
      </InfoSection>
    </InfoPage>
  );
}
