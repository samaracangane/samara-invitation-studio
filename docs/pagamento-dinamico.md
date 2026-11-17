# Pagamento dinamico — Samara Criar Arts

## Decisao de arquitetura

A loja usa um checkout dinamico por pedido. Nao e necessario cadastrar cada convite como produto na plataforma de pagamento.

### Fluxo

1. O cliente escolhe um convite no catalogo.
2. O navegador envia somente o ID do convite e dados minimos de contato para uma Supabase Edge Function.
3. A funcao consulta o convite ativo no banco e le o preco cadastrado. Ela ignora qualquer preco enviado pelo navegador.
4. A funcao cria um pedido com o valor em centavos e uma chave de idempotencia.
5. A funcao cria uma sessao de checkout no provedor e devolve a URL segura para redirecionamento.
6. Um webhook do provedor confirma o resultado. A funcao valida a assinatura/notificacao e consulta o pagamento no provedor antes de marcar o pedido como aprovado.
7. A loja libera instrucoes/entrega somente depois da confirmacao do webhook.

## Provedor inicial sugerido: Mercado Pago Checkout Pro

A API oficial permite criar uma preferencia de pagamento com itens, preco e quantidade no backend e retorna a URL de checkout. Para uma integracao nova, a documentacao atual recomenda avaliar o fluxo Orders API; a Preferences API tambem documenta a criacao de preferencia e o redirecionamento.

Referencias oficiais:
- https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro-orders/overview
- https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro-preferences/create-preference/post

## Seguranca obrigatoria

- Access token do provedor e SUPABASE_SERVICE_ROLE_KEY somente como secrets do servidor/Edge Functions.
- Nunca colocar tokens no frontend, GitHub, variaveis VITE_ ou mensagens.
- O preco e o estado do pedido sao controlados pelo servidor.
- Validar assinatura do webhook e confirmar o pagamento consultando a API do provedor; nao confiar apenas na URL de retorno do navegador.
- Usar idempotencia para evitar cobrancas duplicadas.
- Aplicar rate limiting e validacao dos campos recebidos.
- Nao liberar arquivos/convites antes da confirmacao de pagamento.

## Titularidade e ativacao

A conta do provedor de pagamento, verificacoes de identidade, recebimentos e credenciais devem ser configurados e administrados por um responsavel adulto autorizado, seguindo os termos do provedor. A integracao fica em modo de configuracao ate que a conta e os secrets sejam adicionados com seguranca.

## Proximas tarefas tecnicas

1. Criar Edge Function `create-checkout` para consultar `invites.price`, criar `orders` e abrir checkout.
2. Criar Edge Function `payment-webhook` para validar notificacoes e atualizar pedidos.
3. Ligar o botao Comprar do detalhe do convite a `create-checkout`.
4. Criar tela de sucesso/pendente/falha consultando o pedido no servidor.
5. Testar em ambiente de teste antes de ativar pagamentos reais.

A migration `20261117000000_brand_categories_wiapy.sql` anterior adiciona `checkout_url` para links fixos; esse campo nao e necessario para o fluxo dinamico e pode permanecer sem uso.
