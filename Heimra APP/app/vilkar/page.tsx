import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Vilkår"
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Vilkår"
      intro="Disse vilkårene forklarer hva Hemra er, hvordan tjenesten bør brukes, og hvilke begrensninger som gjelder."
    >
      <InfoSection title="Hva Hemra er">
        <p>Hemra er et digitalt scenarioverktøy for førstegangskjøpere i Norge.</p>
        <p>Hemra kan hjelpe brukere med å forstå:</p>
        <InfoList items={["estimert kjøpekraft", "behov for egenkapital", "hvordan gjeld påvirker muligheter", "mulige veier mot boligkjøp"]} />
      </InfoSection>

      <InfoSection title="Hva Hemra ikke er">
        <p>Hemra er ikke:</p>
        <InfoList items={["bank", "lånetilbyder", "låneformidler", "finansiell rådgiver", "juridisk rådgiver", "eiendomsmegler"]} />
      </InfoSection>

      <InfoSection title="Om beregningene">
        <p>Resultater i Hemra er estimater basert på tall brukeren legger inn, forenklede antakelser, generelle regler og prisdata eller statistikk der dette brukes.</p>
        <p>Resultatene er ikke lånetilsagn, finansieringsbevis eller garanti for boliglån. Banker gjør alltid individuelle vurderinger.</p>
      </InfoSection>

      <InfoSection title="Brukeransvar">
        <p>Brukeren er ansvarlig for egne økonomiske beslutninger. Hemra bør brukes som støtte til oversikt og planlegging, ikke som grunnlag alene for store økonomiske valg.</p>
      </InfoSection>

      <InfoSection title="Tilgjengelighet">
        <p>Hemra forsøker å holde tjenesten tilgjengelig, men kan ikke garantere feilfri drift til enhver tid.</p>
      </InfoSection>

      <InfoSection title="Immaterielle rettigheter">
        <p>Design, logo, kode og innhold tilhører Hemra eller relevante rettighetshavere.</p>
      </InfoSection>

      <InfoSection title="Endringer">
        <p>Vilkårene kan oppdateres ved behov. Oppdatert versjon publiseres på denne siden.</p>
      </InfoSection>
    </InfoPage>
  );
}
