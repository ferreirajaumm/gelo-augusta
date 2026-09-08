# Plano de medição — Gelo Augusta

## Índice de prontidão de medição: 48/100 — **Incompleto**

A estrutura de eventos, consentimento e atribuição foi adicionada, mas não existe ainda um ID confirmado de GA4, Google Ads, Meta Pixel ou GTM. Até estes dados serem configurados e validados, não se devem tomar decisões de investimento baseadas em dados do site.

| Critério | Nota | Situação |
|---|---:|---|
| Alinhamento a decisões | 16/25 | Reservas, chamadas, rota e menu foram priorizados. |
| Clareza do modelo de eventos | 15/20 | Eventos nomeados por intenção e contexto. |
| Precisão e integridade | 4/20 | Requer validação em ambiente de produção. |
| Definição de conversão | 7/15 | WhatsApp aberto é intenção qualificada; não é reserva confirmada. |
| Atribuição e contexto | 4/10 | UTMs e identificadores de clique preservados na sessão. |
| Governança e manutenção | 2/10 | Este documento inicia a documentação; falta proprietário definido. |

## Eventos

| Evento | Gatilho | Propriedades permitidas | Decisão apoiada |
|---|---|---|---|
| `view_reservation` | Secção de reservas visível | idioma, contexto de campanha | Interesse na reserva por origem. |
| `reservation_form_started` | Primeiro foco no formulário | idioma, contexto de campanha | Atrito entre intenção e envio. |
| `reservation_submit_valid` | Formulário válido enviado | idioma, pessoas (faixa) | Procura qualificada por campanha. |
| `whatsapp_reservation_opened` | Janela do WhatsApp aberta após formulário válido | idioma, pessoas (faixa) | Conversão de intenção para Google Ads/Meta. |
| `cta_click` | CTA para reservas | localização do CTA | Melhor posição de CTA. |
| `phone_click` | Clique em telefone | localização do CTA | Procura por chamada. |
| `directions_click` | Clique em rota | localização do CTA | Intenção de visita presencial. |
| `google_business_review_click` | Clique em avaliações no Google | localização do CTA | Confiança social. |
| `menu_view_click` | Clique em ementa | localização do CTA | Interesse no menu. |
| `language_selected` | Troca de idioma | idioma selecionado | Adequação por público internacional. |

**Nunca enviar:** nome, telefone/WhatsApp, data/hora da reserva, texto de mensagem ou qualquer outro dado pessoal.

## Conversões

| Conversão | Evento | Contagem | Plataformas |
|---|---|---|---|
| Intenção de reserva via WhatsApp | `whatsapp_reservation_opened` | Uma por envio válido | GA4, Google Ads e Meta Pixel após consentimento. |
| Reserva confirmada | — | Somente se o processo interno/WhatsApp devolver confirmação de forma consentida | Não está implementada. |

## Configuração necessária antes de publicar tags

Preencher somente IDs reais em `index.html`, dentro de `window.GELO_TRACKING_CONFIG`:

- `ga4MeasurementId` (ex.: `G-XXXXXXXXXX`)
- `googleAdsId` (ex.: `AW-123456789`)
- `googleAdsConversionLabel`
- `metaPixelId`

Preferência operacional: usar um único contentor GTM depois de criado e versionado. Não inserir um segundo contentor sem revisar a implementação existente.

## Validação de publicação

1. Validar consentimento recusado: nenhuma tag de GA/Ads/Meta é carregada.
2. Aceitar medição e confirmar carregamento das tags no modo de pré-visualização/debug.
3. Testar reserva em desktop e mobile; confirmar um único `reservation_submit_valid` e `whatsapp_reservation_opened`, somente quando a janela do WhatsApp abrir.
4. Testar telefone, rota, menu, avaliações e troca de idioma.
5. Confirmar no GA4 DebugView e nas ferramentas de diagnóstico do Google Ads/Meta.
6. Marcar no GA4 apenas `whatsapp_reservation_opened` como evento-chave; não marcar visualizações ou cliques genéricos.
