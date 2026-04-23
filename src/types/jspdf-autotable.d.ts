declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'
  
  export default function autoTable(doc: jsPDF, options: any): void
}

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number
    }
  }
}
