# Guia de Implementação do Google Tag Manager para Aplicações Vue.js

## Visão Geral

Este guia aborda a implementação do Google Tag Manager (GTM) em uma aplicação Vue.js. É importante observar que existem duas implementações diferentes do Google que são frequentemente confundidas:

1. Implementação do Google Tag Manager (GTM)
2. Implementação do Global Site Tag (gtag.js)

Esta documentação concentra-se na implementação do Google Tag Manager (opção 1).

## Passos de Implementação

### 1. Criar um Composable GTM

Primeiro, crie uma função composable que gerencia a inicialização do Google Tag Manager. Este composable será responsável por:

- Injetar o script GTM
- Inicializar a camada de dados (data layer)
- Configurar parâmetros padrão de rastreamento
- Configurar as configurações padrão de consentimento

```typescript
import type { Router } from 'vue-router'

/**
 * A hook that injects the Google Tag Manager script into a web page.
 *
 * @param w - The `window` object, representing the global context of the browser.
 * @param d - The `document` object, representing the HTML document loaded in the window.
 * @param s - The tag name of the element where the GTM script will be injected. Usually "script".
 * @param l - The name of the data layer object. Typically "dataLayer".
 * @param i - The Google Tag Manager ID (GTM-XXXXXX).
 * @param r - The Vue Router instance.
 */
export const useGoogleTagManager = (
  w: Window,
  d: Document,
  s: string = 'script',
  l: string = 'dataLayer',
  i: string,
  r: Router,
): void => {
  // Safely initialize the data layer if it doesn't exist
  const dataLayer = w[l as keyof typeof w] || []
  ;(w as any)[l] = dataLayer // Push the initial GTM event with the current timestamp
  // Os valores inseridos aqui serão adicionados permanentemente
  // nos próximos eventos do GTM

  dataLayer.push({
    event: 'gtm.init',
    visitorType: 'customer',
    pageTitle: d.title,
    pageHostname: w.location.hostname,
    pagePath: r.currentRoute.value.path,
  }) // Push the initial GTM event with the current timestamp

  dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  }) // Get the first script element in the document

  const f = d.getElementsByTagName(s)[0] as HTMLScriptElement // Create a new script element for the GTM script

  const j = d.createElement(s) as HTMLScriptElement // Append a query parameter if the data layer is named differently from the default "dataLayer"

  const dl = l !== 'dataLayer' ? `&l=${l}` : '' // Set the script to load asynchronously

  j.async = true
  j.defer = true // Set the source of the script to the GTM URL with the provided ID

  j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}` // Insert the GTM script before the first script tag in the document

  f.parentNode?.insertBefore(j, f)

  function gtag(...args: any[]) {
    window.dataLayer.push(arguments)
  }

  window.gtag = gtag

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  })
}
```

### 2. Inicializar o Composable

Adicione a inicialização do GTM no ponto de entrada da sua aplicação Vue:

```typescript
// src/main.ts
...
const app = createApp(App)
app.use(router)
useGoogleTagManager(window, document, 'script', 'dataLayer', 'GTM-XXXX', router)
app.mount('#app')
```

### 3. Enviando Eventos Personalizados

Uma vez que o GTM esteja inicializado, você pode enviar eventos personalizados de qualquer lugar da aplicação:

```typescript
window.dataLayer.push({
  event: 'evento_personalizado', // Adicione parâmetros adicionais se necessário
  eventCategory: 'interacao_usuario',
  eventAction: 'clique_botao',
  eventLabel: 'enviar_formulario',
})
```

## Integração com Google Analytics

### Pré-requisitos

- Uma propriedade Google Analytics 4 configurada
- Um fluxo de dados criado no Google Analytics
- O ID de medição (G-XXXXXXXX) do seu fluxo de dados

### Passos de Configuração

**Criar Acionadores no GTM**

- Navegue até Acionadores no seu container GTM
- Crie acionadores que determinarão quando as tags serão disparadas
- Configure filtros de hostname para limitar a execução do acionador ao seu domínio:

```ts
pageHostname equals exemplo.com.br
```

**Configurar Tags**

- Crie uma nova tag de Configuração do Google Analytics 4
- Insira seu ID de medição
- Defina a prioridade de disparo da tag para garantir inicialização antecipada
- Configure os seguintes eventos essenciais:
  - Inicialização do GTM
  - Configuração de Consentimento
  - Visualizações de Página

**Verificar Camada de Dados**

- Após a implementação, verifique se sua camada de dados contém as informações esperadas. Exemplo de um evento de inicialização bem-sucedido:

```ts
{
	event: "gtm.init",
	visitorType: "customer",
	pageTitle: "Título da Sua Página",
	pageHostname: "seu-dominio.com.br",
	pagePath: "/caminho-atual",
	gtm.uniqueEventId: 1
}
```

## Boas Práticas

1. **Gerenciamento de Consentimento**
   - Sempre implemente o gerenciamento adequado de consentimento
   - Configure as configurações padrão de consentimento antes de qualquer disparo de tags
   - Atualize as configurações de consentimento com base nas preferências do usuário
2. **Performance**
   - Use atributos async e defer no script GTM
   - Minimize o número de acionadores e tags
   - Use variáveis incorporadas quando possível
3. **Depuração**
   - Use o modo de Visualização do Google Tag Manager para testes
   - Verifique os dados no painel de Debug do GTM
   - Monitore os relatórios em tempo real no Google Analytics

## Solução de Problemas

Problemas comuns e soluções:

1. **Eventos Não Disparando**
   - Verifique as condições do acionador
   - Confirme os filtros de hostname
   - Inspecione a camada de dados no console do navegador
2. **Dados Não Aparecendo no Analytics**
   - Verifique o ID de medição
   - Confira as configurações de consentimento
   - Garanta que as tags estão disparando no modo de visualização
3. **Múltiplos Disparos de Eventos**
   - Revise as condições do acionador
   - Verifique se há implementações duplicadas de tags
   - Confirme a lógica de envio de eventos
