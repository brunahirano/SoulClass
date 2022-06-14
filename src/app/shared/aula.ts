export class Aula{
  index: number
  keyAula: string
  link: string
  nome: string
  tipo: string
  dataCriacao: any
  dataModificacao: any

  constructor(){
    this.index = 0
    this.keyAula = ''
    this.link = ''
    this.nome = ''
    this.tipo = ''
    this.dataCriacao = new Date()
    this.dataModificacao = new Date()
  }
}
