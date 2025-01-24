import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ConsentStatus = 'granted' | 'denied'

export interface PolicyConfig {
  label: string
  enabled: boolean
  required: boolean
  description: string
}

/**
 * @description Políticas de consentimento para rastreamento e armazenamento de dados
 * @enum {string}
 */
export enum ConsentPolicy {
  /**
   * @description Controla o armazenamento de cookies de publicidade
   * @example Impede que o Google Tag Manager armazene cookies de rastreamento de anúncios
   */
  AD_STORAGE = 'ad_storage',

  /**
   * @description Bloqueia envio de dados de usuário para campanhas publicitárias
   * @example Previne que dados de navegação sejam compartilhados com plataformas de ads como Google Ads
   */
  AD_USER_DATA = 'ad_user_data',

  /**
   * @description Desativa criação de perfis publicitários personalizados
   * @example Evita que o Facebook Ads crie perfis de segmentação baseados no comportamento do usuário
   */
  AD_PERSONALIZATION = 'ad_personalization',

  /**
   * @description Configura coleta de métricas de uso e desempenho
   * @example Permite tracking de eventos e conversões no Google Analytics sem identificação pessoal
   */
  ANALYTICS_STORAGE = 'analytics_storage',

  /**
   * @description Mantém funcionalidades essenciais do site
   * @example Preserva configurações de preferência de idioma e temas sem identificação pessoal
   */
  FUNCTIONALITY_STORAGE = 'functionality_storage',

  /**
   * @description Controla personalização de experiência do usuário
   * @example Impede recomendações personalizadas baseadas em histórico de navegação
   */
  PERSONALIZATION_STORAGE = 'personalization_storage',

  /**
   * @description Ativa mecanismos de proteção de sessão e dados
   * @example Permite validações de sessão e prevenção de fraudes sem rastreamento
   */
  SECURITY_STORAGE = 'security_storage',
}

export type PolicyKey = `${ConsentPolicy}`

export type PolicyMap = Record<PolicyKey, PolicyConfig>

export const useConsentStore = defineStore('consent', () => {
  const showBanner = ref(true)

  const policies = ref<PolicyMap>({
    ad_storage: {
      label: 'Armazenamento de Publicidade',
      description: 'Permite armazenamento relacionado a publicidade (como cookies)',
      enabled: false,
      required: false,
    },
    ad_user_data: {
      label: 'Dados de Usuário para Publicidade',
      description: 'Permite envio de dados do usuário para publicidade',
      enabled: false,
      required: false,
    },
    ad_personalization: {
      label: 'Personalização de Publicidade',
      description: 'Permite publicidade personalizada',
      enabled: false,
      required: false,
    },
    analytics_storage: {
      label: 'Armazenamento de Análise',
      description: 'Permite armazenamento relacionado a análises',
      enabled: false,
      required: false,
    },
    functionality_storage: {
      label: 'Armazenamento de Funcionalidade',
      description: 'Essencial para funcionalidades do site',
      enabled: true,
      required: true,
    },
    personalization_storage: {
      label: 'Armazenamento de Personalização',
      description: 'Permite personalização do site',
      enabled: false,
      required: false,
    },
    security_storage: {
      label: 'Armazenamento de Segurança',
      description: 'Permite funcionalidades de segurança',
      enabled: true,
      required: true,
    },
  })

  const togglePolicy = (key: PolicyKey) => {
    const policy = policies.value[key]
    if (!policy.required) {
      policy.enabled = !policy.enabled
    }
  }

  const acceptAll = () => {
    Object.keys(policies.value).forEach((key) => {
      policies.value[key as PolicyKey].enabled = true
    })
    saveConsent()
  }

  const saveConsent = () => {
    const consentModes = Object.keys(policies.value).reduce(
      (acc, key) => {
        acc[key as PolicyKey] = policies.value[key as PolicyKey].enabled ? 'granted' : 'denied'
        return acc
      },
      {} as Record<PolicyKey, ConsentStatus>,
    )

    if (window.gtag) {
      window.gtag('consent', 'update', consentModes)
    }

    localStorage.setItem('gtm_consent', JSON.stringify(consentModes))
    showBanner.value = false
  }

  const loadSavedConsent = () => {
    const savedConsent = localStorage.getItem('gtm_consent')
    if (savedConsent) {
      const parsedConsent = JSON.parse(savedConsent) as Record<PolicyKey, ConsentStatus>

      Object.keys(policies.value).forEach((key) => {
        const policyKey = key as PolicyKey
        if (!policies.value[policyKey].required) {
          policies.value[policyKey].enabled = parsedConsent[policyKey] === 'granted'
        }
      })

      if (window.gtag) {
        window.gtag('consent', 'update', parsedConsent)
      }

      showBanner.value = false
    }
  }

  return {
    showBanner,
    policies,
    togglePolicy,
    acceptAll,
    saveConsent,
    loadSavedConsent,
  }
})

// Type guard for checking consent status
export const isConsentGranted = (status: ConsentStatus) => status === 'granted'
