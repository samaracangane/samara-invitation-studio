# Pagamentos Wiapy — Samara’s Enchanted Invite

## Estado da integração

Wiapy é o provedor escolhido para a loja. O banco está preparado para registrar pedidos Wiapy, mas **pagamentos reais ainda não estão ativados**: a documentação pública consultada descreve a criação de checkouts pelo painel, mas não documenta uma API pública para criar uma cobrança/checkout com valor arbitrário por pedido.

Não colocar tokens ou credenciais no frontend, no GitHub ou em mensagens.

## O que a documentação pública confirma

- Cada checkout precisa estar associado a um produto cadastrado.
- O checkout define o valor e as formas de pagamento.
- Um checkout pode ter até 10 ofertas com valores diferentes; cada oferta gera seu próprio link.
- O webhook envia uma requisição HTTP POST em JSON e usa o token configurado no cabeçalho Authorization.
- O payload do webhook contém payment.id, payment.status, payment.amount, checkout.id, customer e products. Valores monetários são enviados em centavos.
- Status documentados: paid, unpaid, credit_card_declined, refunded e chargedback.

Fontes oficiais:
- https://help.wiapy.com/pt-br/article/como-criar-um-checkout-e-pegar-o-link-de-venda-1omdaab/
- https://help.wiapy.com/pt-br/article/webhook-jtggmu/

## Arquitetura proposta

1. O cliente escolhe um convite; o navegador envia apenas o ID do convite.
2. O servidor consulta o preço atual do convite no banco e cria um pedido pendente em centavos.
3. O servidor seleciona o checkout Wiapy associado ao convite e redireciona o cliente.
4. O webhook valida o cabeçalho Authorization e confere o checkout, valor, moeda e identificador do pedido com os dados guardados no servidor.
5. O servidor processa o webhook de forma idempotente usando payment.id.
6. Somente com status paid e correspondência integral do pedido o sistema libera o editor e o download.

## Limitação que precisa ser resolvida antes de automatizar

A documentação pública confirma webhooks, mas não confirma endpoint de API para criar um checkout dinâmico por pedido nem um campo de referência externa para associar um pedido interno ao pagamento. Um único checkout compartilhado entre muitos convites não identifica, por si só, qual convite foi comprado.

Caminhos possíveis:
- Solicitar à Wiapy a documentação da API de criação de checkout/pagamento com valor dinâmico e campo de referência externa; ou
- Confirmar se é possível reutilizar um único produto genérico e criar checkouts/ofertas com identificadores individuais para cada convite. O webhook inclui checkout.id, que pode ser mapeado no banco para o convite.

Não implementar correspondência apenas por e-mail e valor: compras simultâneas do mesmo preço podem ser confundidas.

## Segurança e titularidade

- Segredos Wiapy e SUPABASE_SERVICE_ROLE_KEY ficam apenas em secrets do servidor/Edge Functions.
- O preço e o estado do pedido são controlados no servidor, nunca pelo navegador.
- Não liberar o editor apenas porque o cliente voltou à página de sucesso.
- A conta de recebimento e a ativação da Wiapy devem ser feitas por um responsável adulto autorizado, seguindo os requisitos de idade e identidade do provedor.

## Próximas tarefas

1. Obter da Wiapy a confirmação da API/identificador de referência ou do modelo de checkout individual.
2. Implementar Edge Function para criar pedido e encaminhar ao checkout.
3. Implementar webhook Wiapy com validação de Authorization, valor, checkout.id e idempotência.
4. Liberar o editor apenas após pagamento confirmado.
5. Testar com pagamento de teste antes de ativar vendas reais.
