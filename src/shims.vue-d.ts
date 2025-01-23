declare global {
  export interface Window {
    gtag: (...args: any[]) => void
  }
}
