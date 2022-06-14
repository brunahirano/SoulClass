export class Teste{
  keyTeste?: string
  titulo: string
  opcao1?: string
  opcao2?: string
  opcao3?: string
  opcao4?: string
  dataCriacao?: Date
  dataModificacao?: Date
  descricao: string
  quantidade?: number
  tentativa: number
  id?:any
  questoes?: Array<any>
  tipo?: any
  acerto?: any

  constructor(){
    this.keyTeste = ''
    this.titulo = ''
    this.opcao1 = ''
    this.opcao2 = ''
    this.opcao3 = ''
    this.opcao4 = ''
    this.dataCriacao = new Date()
    this.dataModificacao = new Date()
    this.descricao = ''
    this.tentativa = 0
    this.id = ""
    this.tipo = ''
  }
}
