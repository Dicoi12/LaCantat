/**
 * Utilitar pentru actualizarea automată a PWA
 * Reîmprospătează automat pagina când detectează o nouă versiune (similar cu Ctrl+F5)
 */

export function setupAutoUpdate() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  let refreshing = false

  // Ascultă pentru schimbări ale service worker-ului
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    
    // Reîmprospătează pagina când service worker-ul se actualizează
    // Folosește location.reload() pentru a forța reîncărcarea (similar cu Ctrl+F5)
    window.location.reload()
  })

  // Funcție pentru a activa service worker-ul nou
  const activateNewWorker = (worker: ServiceWorker | null) => {
    if (!worker) return
    
    // Trimite mesaj pentru a activa service worker-ul nou
    worker.postMessage({ type: 'SKIP_WAITING' })
    
    // Workbox ar trebui să răspundă automat, dar dacă nu, reîmprospătează după un scurt delay
    setTimeout(() => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }, 1000)
  }

  // Verifică periodic pentru actualizări (la fiecare 60 de secunde)
  setInterval(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        // Verifică dacă există o actualizare disponibilă
        await registration.update()
        
        // Dacă există un service worker în așteptare, activează-l
        if (registration.waiting) {
          activateNewWorker(registration.waiting)
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }, 60000) // Verifică la fiecare 60 de secunde

  // Verifică imediat la încărcarea paginii
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration) {
      // Verifică dacă există deja un service worker în așteptare
      if (registration.waiting) {
        activateNewWorker(registration.waiting)
      }

      // Verifică pentru actualizări
      registration.update()

      // Ascultă pentru evenimentul 'updatefound'
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            // Când noul service worker este instalat și există unul activ
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Activează imediat noul service worker
              activateNewWorker(newWorker)
            }
          })
        }
      })
    }
  })
}

