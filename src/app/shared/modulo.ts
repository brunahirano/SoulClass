import { Aula } from "./aula"
export class Modulo{

  keyModulo:string
  nome: string
  descricao: string
  dataCriacao?: Date
  dataModificacao?: Date
  index?:number
  aulas?: Array<Aula>

  constructor(){
    this.keyModulo = ""
    this.nome = ''
    this.descricao = ''
    this.dataCriacao = new Date()
    this.dataModificacao = new Date()
    this.aulas = []
  }
}
