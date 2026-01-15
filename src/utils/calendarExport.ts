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

  // Creează blob și descarcă fișierul
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'lacantat-evenimente.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
