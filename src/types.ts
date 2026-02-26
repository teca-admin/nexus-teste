export type Role = "Admin" | "RH" | "SST" | "Escala" | "Treinamento" | "Gestor";

export interface User {
  id: number;
  username: string;
  role: Role;
  name: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  data_admissao: string;
  cargo: string;
  setor: string;
  status: string;
}
