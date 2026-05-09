import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Personvern"
};

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Personvern"
      intro="Hemra ønsker å samle inn minst mulig personopplysninger og være tydelige på hvordan opplysninger behandles."
    >
      <InfoSection title="Hvilke opplysninger behandles?">
        <p>Tall som legges inn i kalkulatoren brukes normalt kun for å vise resultatet. Kalkulatortall behandles normalt lokalt i nettleseren, og opplysningene lagres normalt ikke hos Hemra i dagens versjon.</p>
        <p>Tekniske data kan behandles for å drifte og forbedre tjenesten:</p>
        <InfoList items={["sidevisninger", "nettlesertype", "enhetstype", "anonymisert IP der relevant", "tekniske feil og ytelsesdata"]} />
      </InfoSection>

      <InfoSection title="Hvorfor behandles opplysninger?">
        <InfoList items={["levere nettsiden", "vise beregninger", "forbedre tjenesten", "analysere bruksmønstre", "oppdage feil", "svare på henvendelser", "ivareta sikkerhet"]} />
      </InfoSection>

      <InfoSection title="Rettslig grunnlag">
        <p>For drift og forbedring av Hemra brukes normalt berettiget interesse. Der samtykke kreves, for eksempel for enkelte cookies eller analyseverktøy, skal dette innhentes først. Dersom Hemra senere tilbyr brukerfunksjoner, kan behandling også bygge på avtale.</p>
      </InfoSection>

      <InfoSection title="Deling">
        <p>Hemra selger ikke personopplysninger. Data kan behandles av leverandører som hjelper oss med hosting, analyse, teknisk drift og e-post.</p>
      </InfoSection>

      <InfoSection title="Lagringstid">
        <p>Opplysninger lagres bare så lenge det er nødvendig for formålet de ble samlet inn for. Kalkulatortall lagres normalt ikke hos Hemra i dagens versjon.</p>
      </InfoSection>

      <InfoSection title="Dine rettigheter">
        <p>Du kan be om innsyn, retting, sletting, begrensning, protest eller trekke samtykke tilbake der behandlingen bygger på samtykke.</p>
        <p>Du kan også klage til Datatilsynet dersom du mener personopplysninger behandles i strid med regelverket.</p>
      </InfoSection>

      <InfoSection title="Endringer">
        <p>Hemra kan oppdatere denne siden ved behov. Den nyeste versjonen vil alltid ligge tilgjengelig her.</p>
      </InfoSection>
    </InfoPage>
  );
}
