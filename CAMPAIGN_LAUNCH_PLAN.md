# Plano de campanha — Gelo Augusta

Atualizado em 10 de setembro de 2026. Este documento prepara a campanha; não ativa anúncios nem altera orçamento.

## Objetivo

Gerar pedidos de reserva qualificados para o WhatsApp **+351 967 573 815**, com foco em pessoas que procuram uma marisqueira, peixe fresco ou cozinha portuguesa na Baixa de Lisboa.

## Proposta de valor para o Google Ads

> O Gelo Augusta é uma marisqueira e restaurante de cozinha portuguesa na Rua Augusta, na Baixa de Lisboa. A ementa reúne marisco fresco, peixe do dia, arrozes, paellas, carnes e opções para partilhar, para almoços, jantares e grupos. Consulte a ementa completa e peça a sua reserva diretamente pelo WhatsApp.

## Estrutura recomendada

### 1. Google Search — Reservas Lisboa

- **Meta:** pedido de reserva por WhatsApp.
- **Página de destino:** `https://www.geloaugusta.pt/?utm_source=google&utm_medium=cpc&utm_campaign=search_reservas_lisboa&utm_content={creative}`
- **Conversão primária:** `generate_lead`, disparada após a abertura válida do WhatsApp. Não representa uma reserva confirmada.
- **Segmentação geográfica:** presença em Lisboa; confirmar no Google Ads se o alcance deve incluir apenas residentes, visitantes ou ambos.
- **Rede:** Pesquisa Google. Começar sem parceiros de pesquisa para leitura mais limpa dos termos.
- **Idiomas:** português, inglês e espanhol, pois o site disponibiliza as três versões.

#### Grupos de anúncios e palavras-chave iniciais

| Grupo | Correspondência de frase | Correspondência exata |
|---|---|---|
| Marca | "gelo augusta" | [gelo augusta] |
| Marisqueira local | "marisqueira lisboa", "marisqueira baixa lisboa", "marisqueira rua augusta" | [marisqueira lisboa], [marisqueira rua augusta] |
| Peixe fresco | "restaurante peixe fresco lisboa", "peixe fresco baixa lisboa" | [restaurante peixe fresco lisboa] |
| Cozinha portuguesa | "restaurante cozinha portuguesa lisboa", "restaurante português baixa lisboa" | [restaurante cozinha portuguesa lisboa] |
| Reserva | "reservar restaurante lisboa", "reservar mesa rua augusta" | [reservar restaurante lisboa], [reservar mesa rua augusta] |

Não usar correspondência ampla na primeira fase. Depois de acumular termos de pesquisa, ampliar somente os termos comprovadamente relevantes.

#### Palavras-chave negativas iniciais

`emprego`, `trabalho`, `vaga`, `receita`, `receitas`, `curso`, `escola`, `fornecedor`, `atacado`, `congelado`, `grátis`, `barato`, `delivery`, `take away`, `menu pdf`, `foto`, `imagens`

Revisar semanalmente: negativas dependem dos termos reais e não devem bloquear intenção válida.

### 2. Meta Ads — Descoberta e remarketing

- **Meta:** levar tráfego qualificado à página de reserva e construir públicos de remarketing apenas com consentimento de marketing válido.
- **Criativos:** usar os vídeos reais do restaurante e fotos autênticas de marisco, peixe fresco e cozinha portuguesa.
- **CTA:** “Reservar agora” ou “Saiba mais”, direcionando para o site com UTM.
- **URL:** `https://www.geloaugusta.pt/?utm_source=meta&utm_medium=paid_social&utm_campaign=reservas_lisboa&utm_content={{ad.name}}`
- **Públicos iniciais:** raio/localização a confirmar no Gestor de Anúncios; separar visitantes do site consentidos do público de descoberta.
- **Não publicar automaticamente:** validar conta, Pixel, página Facebook, perfil Instagram e política de consentimento primeiro.

## RSA — anúncios responsivos de pesquisa

Todos os títulos têm até 30 caracteres e as descrições até 90 caracteres.

### Títulos

| Título | Caracteres |
|---|---:|
| Gelo Augusta em Lisboa | 22 |
| Marisco na Rua Augusta | 22 |
| Reserve a sua mesa | 18 |
| Peixe Fresco em Lisboa | 22 |
| Cozinha Portuguesa | 18 |
| Restaurante na Baixa | 20 |
| Veja a ementa completa | 22 |
| Reserva por WhatsApp | 20 |
| Marisco para Partilhar | 22 |
| Almoços e Jantares | 18 |
| Paellas e Arrozes | 17 |
| Restaurante Gelo Augusta | 24 |
| Mesa para Grupos | 16 |
| Sabores do Mar em Lisboa | 24 |
| Conheça o Gelo Augusta | 22 |

### Descrições

| Descrição | Caracteres |
|---|---:|
| Marisco, peixe fresco e cozinha portuguesa na Rua Augusta. Reserve pelo WhatsApp. | 81 |
| Consulte a ementa do Gelo Augusta e envie o seu pedido de reserva online. | 73 |
| Para almoços, jantares e grupos na Baixa de Lisboa. Veja a ementa completa. | 75 |
| Escolha data, hora e pessoas no site. O pedido segue direto para o WhatsApp. | 76 |

### Recursos

- **Sitelink — Reservar mesa:** `https://www.geloaugusta.pt/#reserva`
- **Sitelink — Ver ementa:** `https://www.geloaugusta.pt/ementa`
- **Sitelink — Como chegar:** URL de Google Maps confirmada no site
- **Sitelink — Contacto:** `https://www.geloaugusta.pt/#contato`
- **Destaques:** “Marisco fresco”, “Peixe do dia”, “Cozinha portuguesa”, “Reserva por WhatsApp”, “Rua Augusta, Lisboa”
- **Extensão de chamada:** +351 967 573 815

## Medição e qualidade

1. Inserir IDs reais de GA4, Google Ads e Meta Pixel em `index.html`; não usar IDs de teste.
2. Marcar `generate_lead` como evento-chave no GA4.
3. Importar a conversão para Google Ads **ou** usar a conversão direta Google Ads; evitar medir a mesma ação duas vezes como conversões primárias.
4. Fazer um teste consentido em desktop e celular; confirmar **uma** conversão por abertura válida do WhatsApp.
5. Não enviar nome, telefone, data, hora ou a mensagem da reserva para plataformas de anúncio.
6. Uma reserva confirmada exige processo interno no WhatsApp; a abertura do WhatsApp é intenção de reserva, não confirmação.

## Antes de publicar

- [ ] Customer ID e acesso da conta Google Ads.
- [ ] Orçamento diário confirmado em EUR.
- [ ] ID GA4, ID/label Google Ads e Meta Pixel inseridos e validados.
- [ ] Perfil da Empresa no Google reivindicado e atualizado.
- [ ] Uma campanha criada como **pausada** e revisada.
- [ ] Confirmação explícita antes de ativar qualquer campanha ou gasto.
