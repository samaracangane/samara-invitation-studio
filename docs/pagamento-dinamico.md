# Pagamentos Wiapy e editor — Samara’s Enchanted Invite

## O que já está preparado no repositório

- Tabela de ofertas Wiapy por faixa de preço (wiapy_offers).
- Criação segura de pedido no servidor (create-checkout): o preço vem do catálogo Supabase, nunca do navegador.
- Webhook Wiapy (wiapy-webhook) com autenticação pelo header Authorization.
- Consulta privada do pedido (order-status) usando token de acesso individual.
- Salvamento do projeto editado (save-design) somente depois de o pedido estar aprovado.
- Página de retorno /retorno, editor /editor e painel de faixas Wiapy /pagamentos.
- O editor permite textos em camadas, adesivos, mover elementos, ordenar, ocultar, bloquear, desfazer/refazer e exportar PNG/SVG após a aprovação do pedido.

## Modelo de checkout sem cadastrar cada convite como produto

A documentação pública da Wiapy informa que todo checkout precisa estar associado a um produto cadastrado; um checkout pode ter até 10 ofertas, cada uma com nome, preço e link próprio. O webhook envia payment.id, payment.status, payment.amount, checkout.id e customer.email. Os valores monetários são enviados em centavos e a autenticação do webhook usa o header Authorization.

Assim, a arquitetura preparada usa um produto digital genérico e ofertas por faixa de preço. Os convites que tiverem o mesmo preço reutilizam o mesmo link de oferta. Isso evita cadastrar um produto Wiapy para cada convite. Se a loja precisar de mais de 10 faixas de preço, será necessário configurar outro checkout ou simplificar os preços.

Fonte oficial do checkout: https://help.wiapy.com/pt-br/article/como-criar-um-checkout-e-pegar-o-link-de-venda-1omdaab/
Fonte oficial do webhook: https://help.wiapy.com/pt-br/article/webhook-jtggmu/

## Como o pedido funciona

1. O cliente escolhe um convite e informa o e-mail.
2. A função create-checkout consulta o convite ativo no Supabase e lê seu preço.
3. A função encontra a oferta ativa de mesmo preço em wiapy_offers, cria o pedido pendente e gera um token individual de acesso.
4. O cliente é enviado para o link da oferta Wiapy correspondente.
5. A Wiapy chama wiapy-webhook com o evento de pagamento.
6. O webhook confere o token Authorization e tenta identificar exatamente um pedido por checkout, valor e e-mail.
7. Somente um pedido identificado sem ambiguidade pode ser marcado como aprovado.
8. O cliente consulta o pedido em /retorno. O editor valida o token e o status; só pedidos aprovados podem exportar e salvar na nuvem.

Proteção contra liberação errada: se houver zero ou mais de um pedido que corresponda ao evento, nenhum deles é liberado automaticamente. O evento fica registrado para reconciliação.

## Configuração necessária no painel

1. Na Wiapy, o responsável pela conta cria um produto digital genérico.
2. Cria um checkout desse produto e configura as ofertas com os preços utilizados na loja (até 10 ofertas por checkout).
3. Copia o ID do checkout e o link individual de cada oferta.
4. No site, abre /pagamentos e cadastra cada faixa de preço, usando o ID do checkout e o link da oferta correspondente.
5. No painel de integrações da Wiapy, configura o webhook para: https://SEU-PROJETO.supabase.co/functions/v1/wiapy-webhook
6. Define um token próprio no campo de autenticação do webhook. O mesmo valor deve ser salvo como secret WIAPY_WEBHOOK_TOKEN no Supabase.

O URL de retorno /retorno pode ser configurado como página externa de obrigado caso a configuração da Wiapy permita essa opção para o checkout. O cliente precisa retornar ao mesmo navegador onde iniciou o pedido, pois o token individual fica guardado localmente para proteger o acesso.

## Publicação do Supabase

Um responsável autorizado com acesso ao projeto Supabase precisa aplicar a migration e publicar as funções. Com Supabase CLI instalado e o projeto correto vinculado:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
supabase secrets set WIAPY_WEBHOOK_TOKEN=SEU_TOKEN
supabase functions deploy create-checkout
supabase functions deploy wiapy-webhook
supabase functions deploy order-status
supabase functions deploy save-design
```

O ambiente de Edge Functions também precisa ter SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY configurados como secrets. Nunca coloque a service role key, o token Wiapy ou senhas em arquivos do frontend, no GitHub ou em mensagens.

A migration 20261117170000_wiapy_editor_access.sql cria as ofertas, os projetos salvos e o registro de eventos, além de inserir os cinco modelos com preço já existentes no catálogo atual. As imagens e os demais produtos da Paper Love Digital ainda precisam ser importados para o catálogo e para o Storage.

## Limitações e cuidados

- A documentação pública consultada não confirma uma API Wiapy para gerar um checkout com valor arbitrário por pedido. Por isso, esta integração usa links fixos por faixa de preço, com o servidor controlando o valor.
- A associação do webhook depende de checkout ID, valor e e-mail. Pedidos simultâneos idênticos podem ficar sem correspondência automática; nesses casos não há liberação automática.
- A função não envia e-mail de acesso. O cliente retorna pela página /retorno no mesmo navegador, ou o responsável pode definir outro fluxo de entrega depois.
- O editor salva automaticamente no navegador. Após a confirmação e a publicação das funções, também salva o projeto no Supabase associado ao pedido.
- A migration e as Edge Functions estão no GitHub, mas ainda precisam ser aplicadas/publicadas no projeto Supabase; o repositório sozinho não faz esse deploy.
- A conta Wiapy, ativação de identidade, recebimentos e credenciais devem ser administrados por um responsável adulto autorizado, seguindo as regras da plataforma.
