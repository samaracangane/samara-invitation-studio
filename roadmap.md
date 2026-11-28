# Migração de pagamentos para Asaas

- [x] Criar branch isolada para a integração.
- [x] Conectar o checkout público ao fluxo Asaas já existente no servidor.
- [x] Solicitar nome e CPF/CNPJ do comprador para gerar a cobrança.
- [x] Consultar o status do pedido pela função de servidor, mantendo compatibilidade com pedidos antigos.
- [x] Substituir o painel de configuração Wiapy por painel de status, webhook e reconciliação Asaas.
- [ ] Validar build, tipos e testes automatizados.
- [ ] Configurar os secrets do servidor no ambiente de hospedagem, sem expor credenciais.
- [ ] Aplicar as migrations no Supabase e validar RLS/permissões.
- [ ] Configurar webhook e reconciliação após publicar a rota.
- [ ] Testar em sandbox sem criar cobranças reais e só então planejar a ativação em produção.
