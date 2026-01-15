import type { Event } from '@/composables/useEvents'

/**
 * Generează un fișier .ics (iCalendar) cu evenimentele viitoare
 * Funcționează pe iOS (Apple Calendar) și Android (Google Calendar)
 */
export function exportToCalendar(events: Event[]): void {
  if (events.length === 0) {
    return
  }

  // Generează conținutul fișierului .ics
  let icsContent = 'BEGIN:VCALENDAR\r\n'
  icsContent += 'VERSION:2.0\r\n'
  icsContent += 'PRODID:-//LaCantat//Evenimente//RO\r\n'
  icsContent += 'CALSCALE:GREGORIAN\r\n'
  icsContent += 'METHOD:PUBLISH\r\n'

  events.forEach((event, index) => {
    // Parsează data și ora
    const [year, month, day] = event.event_date.split('-').map(Number)
    const [hours, minutes] = event.event_time.split(':').map(Number)
    
    // Creează obiecte Date pentru început și sfârșit (presupunem 2 ore durată)
    const startDate = new Date(year!, month! - 1, day!, hours!, minutes!)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // +2 ore

    // Formatează datele în format iCalendar (YYYYMMDDTHHmmssZ pentru UTC)
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      // Folosim format local (fără Z) pentru a păstra ora locală
      return `${year}${month}${day}T${hours}${minutes}${seconds}`
    }

    // Generează UID unic pentru fiecare eveniment
    const uid = `lacantat-${event.id}-${Date.now()}-${index}@lacantat.ro`

    // Escape special characters pentru descriere
    const escapeText = (text: string): string => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
    }

    const eventTypeLabel = getEventTypeLabel(event.type)
    const description = `Tip: ${eventTypeLabel}${event.location ? `\\nLocație: ${event.location}` : ''}`

    icsContent += 'BEGIN:VEVENT\r\n'
    icsContent += `UID:${uid}\r\n`
    icsContent += `DTSTART:${formatDate(startDate)}\r\n`
    icsContent += `DTEND:${formatDate(endDate)}\r\n`
    icsContent += `DTSTAMP:${formatDate(new Date())}\r\n`
    icsContent += `SUMMARY:${escapeText(event.title)}\r\n`
    icsContent += `DESCRIPTION:${escapeText(description)}\r\n`
    if (event.location) {
      icsContent += `LOCATION:${escapeText(event.location)}\r\n`
    }
    icsContent += 'STATUS:CONFIRMED\r\n'
    icsContent += 'SEQUENCE:0\r\n'
    icsContent += 'END:VEVENT\r\n'
  })

  icsContent += 'END:VCALENDAR\r\n'

  // Creează blob și încearcă să deschidă direct în calendar
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  // Încearcă să deschidă direct în calendar (funcționează pe iOS și unele browsere)
  // Pe iOS, acest link va deschide Apple Calendar direct
  const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
  
  // Încearcă mai întâi să deschidă direct
  try {
    // Pe iOS/Safari, acest link va deschide calendarul direct
    window.location.href = dataUrl
  } catch (error) {
    // Dacă nu funcționează, descarcă fișierul
    const link = document.createElement('a')
    link.href = url
    link.download = 'lacantat-evenimente.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Curăță URL-ul după un scurt delay
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

/**
 * Deschide evenimentul direct în Google Calendar (calendar invite)
 */
export function openInGoogleCalendar(event: Event): void {
  const [year, month, day] = event.event_date.split('-').map(Number)
  const [hours, minutes] = event.event_time.split(':').map(Number)
  
  const startDate = new Date(year!, month! - 1, day!, hours!, minutes!)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // +2 ore
  
  // Formatează datele pentru Google Calendar (YYYYMMDDTHHmmssZ)
  const formatGoogleDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
  }
  
  const start = formatGoogleDate(startDate)
  const end = formatGoogleDate(endDate)
  
  const eventTypeLabel = getEventTypeLabel(event.type)
  const description = `Tip: ${eventTypeLabel}${event.location ? `\\nLocație: ${event.location}` : ''}`
  
  // Creează URL pentru Google Calendar
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: description,
    location: event.location || ''
  })
  
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank')
}

/**
 * Deschide evenimentul direct în Apple Calendar (folosind link mailto:)
 */
export function openInAppleCalendar(event: Event): void {
  const [year, month, day] = event.event_date.split('-').map(Number)
  const [hours, minutes] = event.event_time.split(':').map(Number)
  
  const startDate = new Date(year!, month! - 1, day!, hours!, minutes!)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // +2 ore
  
  // Formatează datele pentru iCal (YYYYMMDDTHHmmss)
  const formatICalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}${month}${day}T${hours}${minutes}${seconds}`
  }
  
  const start = formatICalDate(startDate)
  const end = formatICalDate(endDate)
  const now = formatICalDate(new Date())
  
  const eventTypeLabel = getEventTypeLabel(event.type)
  const description = `Tip: ${eventTypeLabel}${event.location ? `\\nLocație: ${event.location}` : ''}`
  
  // Generează conținutul .ics pentru mailto:
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DTSTAMP:${now}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${event.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\\n')
  
  // Folosește mailto: cu attachment .ics (funcționează pe iOS)
  const mailtoLink = `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(description)}&attachment=data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
  
  // Pe iOS, acest link va deschide Apple Calendar
  // Pe desktop, va deschide clientul de email cu attachment
  window.location.href = mailtoLink
}

function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    cununie: 'Cununie',
    botez: 'Botez',
    majorat: 'Majorat',
    nunta: 'Nuntă',
    altu: 'Altul'
  }
  return labels[type] || type
}
