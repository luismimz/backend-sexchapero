import { createParamDecorator, ExecutionContext } from '@nestjs/common';
//esto facilita la obtención del usuario autenticado en los controladores
//por ejemplo, en un controlador, puedes usarlo así:
export const GetUser = createParamDecorator(
  (data:unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Assuming user is attached to the request object
  },
);