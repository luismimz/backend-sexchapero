import { SetMetadata } from "@nestjs/common";

//constante para definir el nombre del metadato de roles
export const ROLES_KEY = 'roles';

//esta funcion decoradora nos permite poner @Roles(['admin', 'user']) en los controladores o métodos
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles); 