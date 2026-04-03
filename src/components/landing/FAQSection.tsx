import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  return (
    <section className="py-32 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-black text-center text-slate-900 mb-16 uppercase tracking-tighter">
          Questions <span className="text-[#32d74b]">Fréquentes</span>
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-white rounded-2xl border border-slate-200 shadow-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-[#32d74b] transition-colors">
              Comment fonctionne l'analyse satellite ?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 pt-2">
              Nous utilisons des images Sentinel-2 pour analyser la végétation (NDVI) et prédire les rendements en temps réel.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="bg-white rounded-2xl border border-slate-200 shadow-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-[#32d74b] transition-colors">
              L'IA est-elle fiable pour les prédictions ?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 pt-2">
              Oui, nos modèles sont entraînés sur des données historiques et ajustés pour le contexte ivoirien.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="bg-white rounded-2xl border border-slate-200 shadow-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-[#32d74b] transition-colors">
              Puis-je accéder aux données gratuitement ?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 pt-2">
              Une version de base est gratuite pour les agriculteurs. Contactez-nous pour les options premium.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}