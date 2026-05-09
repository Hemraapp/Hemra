import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Begrensninger og forutsetninger"
};

export default function AssumptionsPage() {
  return (
    <InfoPage
      title="Begrensninger og forutsetninger"
      intro="Hemra er laget for å gi bedre oversikt, ikke absolutte svar."
    >
      <InfoSection title="Formålet med Hemra">
        <p>Hemra hjelper førstegangskjøpere med å forstå hva som påvirker veien mot boligkjøp. Resultatene skal gjøre planlegging enklere og samtalen med bank mer forberedt.</p>
      </InfoSection>

      <InfoSection title="Forenklede beregninger">
        <p>Kalkulatoren bruker forenklede antakelser om blant annet:</p>
        <InfoList items={["inntekt", "gjeld", "egenkapital", "rente", "boligprisnivå", "lånegrenser"]} />
      </InfoSection>

      <InfoSection title="Banker vurderer mer">
        <p>En bank kan også vurdere:</p>
        <InfoList items={["arbeidsforhold", "betalingshistorikk", "kredittkortgrenser", "faste utgifter", "forsørgeransvar", "sikkerhet i boligen", "interne retningslinjer"]} />
      </InfoSection>

      <InfoSection title="Boligpriser varierer">
        <p>Faktiske boliger kan koste mer eller mindre enn beregnet. Pris påvirkes av:</p>
        <InfoList items={["beliggenhet", "standard", "størrelse", "boligtype", "fellesgjeld", "markedssituasjon", "budrunde"]} />
      </InfoSection>

      <InfoSection title="Bruk resultatet riktig">
        <p>Bruk Hemra som et planleggingsverktøy og oversikt, ikke som en garanti.</p>
        <p>Ved store økonomiske beslutninger bør bruker kontakte bank eller relevant fagperson.</p>
      </InfoSection>
    </InfoPage>
  );
}
