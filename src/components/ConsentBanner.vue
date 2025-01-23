<template>
  <div v-if="showBanner" class="consent-banner">
    <div class="consent-content">
      <h2>Configurações de Privacidade</h2>
      <div class="consent-options">
        <div v-for="(policy, key) in policies" :key="key" class="consent-policy">
          <label>
            <input
              type="checkbox"
              :checked="policy.enabled"
              @change="togglePolicy(key)"
              :disabled="policy.required"
            />
            {{ policy.label }}
          </label>
          <small>{{ policy.description }}</small>
        </div>
      </div>

      <div class="consent-actions">
        <button @click="acceptAll" class="btn-accept">Aceitar Todos</button>
        <button @click="saveConsent" class="btn-save">Salvar Preferências</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// Estado reativo
const showBanner = ref(true)
const policies = reactive({
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

// Funções para manipular o consentimento
const togglePolicy = (key: keyof typeof policies) => {
  if (!policies[key].required) {
    policies[key].enabled = !policies[key].enabled
  }
}

const acceptAll = () => {
  Object.keys(policies).forEach((key) => {
    policies[key as keyof typeof policies].enabled = true
  })
  saveConsent()
}

const saveConsent = () => {
  const consentModes = Object.keys(policies).reduce(
    (acc, key) => {
      acc[key] = policies[key as keyof typeof policies].enabled ? 'granted' : 'denied'
      return acc
    },
    {} as Record<string, 'granted' | 'denied'>,
  )

  if (window.gtag) {
    window.gtag('consent', 'update', consentModes)
  }

  localStorage.setItem('gtm_consent', JSON.stringify(consentModes))
  showBanner.value = false
}

// Recupera o consentimento salvo ao montar o componente
onMounted(() => {
  const savedConsent = localStorage.getItem('gtm_consent')
  if (savedConsent) {
    const parsedConsent = JSON.parse(savedConsent)
    Object.keys(policies).forEach((key) => {
      if (!policies[key as keyof typeof policies].required) {
        policies[key as keyof typeof policies].enabled = parsedConsent[key] === 'granted'
      }
    })

    if (window.gtag) {
      window.gtag('consent', 'update', parsedConsent)
    }

    showBanner.value = false
  }
})
</script>

<style scoped>
.consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #f8f9fa;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.consent-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 0;
}

.consent-policy {
  display: flex;
  flex-direction: column;
}

.consent-policy label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.consent-policy small {
  color: #6c757d;
  margin-left: 25px;
}

.consent-actions {
  display: flex;
  gap: 10px;
}

.btn-accept,
.btn-save {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.btn-accept {
  background-color: #28a745;
  color: white;
}

.btn-save {
  background-color: #007bff;
  color: white;
}
</style>
