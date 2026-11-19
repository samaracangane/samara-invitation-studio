import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Samara Criar Art's Convites" },
      {
        name: "description",
        content:
          "Saiba quais dados a Samara Criar Art's Convites coleta, com quem compartilha e como gerenciar suas preferências de cookies.",
      },
      { property: "og:title", content: "Política de Privacidade — Samara Criar Art's Convites" },
      {
        property: "og:description",
        content: "Como tratamos seus dados, cookies e preferências de privacidade.",
      },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: novembro de 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-7 text-[#60475f]">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">1. Dados que coletamos</h2>
            <p className="mt-2">
              Quando você navega na loja, contamos visitas e ações como cliques e páginas vistas. Ao fazer um
              pedido, coletamos os dados que você informa no formulário, como nome, WhatsApp e as informações de
              personalização do convite, usados apenas para produzir e entregar o seu pedido.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground">2. Cookies e medição</h2>
            <p className="mt-2">
              A contagem de visitas é feita pela Lovable, plataforma onde nossa loja está hospedada, sem uso de
              cookies. Se você aceitar no aviso de cookies, também medimos cliques e outras ações para entender
              como a loja é usada.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground">3. Publicidade (Meta)</h2>
            <p className="mt-2">
              Com o seu consentimento, usamos o Pixel da Meta (Facebook e Instagram), que utiliza cookies para
              medir o resultado dos nossos anúncios, otimizar a exibição deles e mostrar anúncios relevantes a
              quem já visitou a loja. Para isso, informações sobre sua visita (como páginas vistas e ações no
              site) são compartilhadas com a Meta Platforms.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground">4. Suas escolhas</h2>
            <p className="mt-2">
              Você pode aceitar ou recusar cookies de análise e publicidade no aviso de cookies, e mudar sua
              decisão a qualquer momento no link <strong>Configurações de cookies</strong>, no rodapé do site. A
              recusa impede o envio de dados de publicidade a partir do momento em que é feita. Se o seu navegador
              enviar o sinal Global Privacy Control, ele é tratado como recusa automaticamente.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground">5. Contato</h2>
            <p className="mt-2">
              Para dúvidas sobre seus dados ou para pedir a exclusão deles, fale conosco pela página de contato
              da loja.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
