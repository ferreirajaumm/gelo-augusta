# Prontidão de aquisição — Gelo Augusta

Atualizado em 2026-09-09.

## Objetivo

Gerar reservas qualificadas pelo WhatsApp do Gelo Augusta: **+351 967 573 815**.

## O que já está pronto no site

- Formulário de reservas com nome, telefone, data, hora e número de pessoas.
- Encaminhamento validado para `https://wa.me/351967573815`.
- Captura de UTMs, `gclid`, `gbraid`, `wbraid` e `fbclid` na sessão.
- Consentimento granular: essencial, análise e campanhas.
- Eventos sem dados pessoais:
  - `view_reservation`
  - `reservation_form_started`
  - `reservation_submit_valid`
  - `whatsapp_reservation_opened`
  - `generate_lead` — evento padrão GA4 após a abertura válida do WhatsApp.
- Estrutura para conversão Google Ads e evento `Lead` do Meta Pixel, sempre após consentimento de marketing.

## Dados ainda necessários para ativação real

Os identificadores abaixo não foram inventados e não devem ser substituídos por valores de teste em produção:

| Plataforma | Dado necessário | Onde configurar |
|---|---|---|
| Google Analytics 4 | Measurement ID `G-...` | `window.GELO_TRACKING_CONFIG.ga4MeasurementId` em `index.html` |
| Google Ads | ID `AW-...` e rótulo de conversão | `googleAdsId` e `googleAdsConversionLabel` |
| Meta Ads | ID numérico do Pixel | `metaPixelId` |
| GA4 | Marcar `generate_lead` como evento-chave | Interface GA4 |
| Google Ads | Importar a conversão GA4 ou confirmar a tag direta | Interface Google Ads |
| Meta Ads | Confirmar o evento `Lead` no Gestor de Eventos | Interface Meta |

## Campanhas recomendadas após medição confirmada

1. **Google Search — intenção alta**
   - Foco: termos de marca, “marisqueira rua augusta”, “marisco baixa lisboa”, “restaurante peixe fresco lisboa”.
   - Destino: `https://gelo-augusta.vercel.app/?utm_source=google&utm_medium=cpc&utm_campaign=search_reservas_lisboa`
   - Conversão: `generate_lead`.
2. **Meta Ads — descoberta local e remarketing**
   - Criativos: vídeos verticais da experiência e imagens reais de marisco, peixe e cozinha portuguesa.
   - Público: residentes e visitantes em Lisboa; separar remarketing de visitantes com consentimento de marketing.
   - Destino com UTM: `?utm_source=meta&utm_medium=paid_social&utm_campaign=reservas_lisboa`.

## Checklist obrigatório antes de investir

1. Inserir os três IDs reais acima.
2. Aceitar “análises” e concluir uma reserva de teste: confirmar `generate_lead` no DebugView do GA4.
3. Aceitar “campanhas” e repetir o teste: confirmar a conversão Google Ads e o `Lead` do Meta Pixel.
4. Validar uma única conversão por abertura de WhatsApp.
5. Não enviar nome, telefone, data ou hora do cliente para GA4, Google Ads ou Meta.
