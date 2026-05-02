import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Populated by JwtStrategy.validate */
export interface JwtAuthUser {
  userId: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtAuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtAuthUser }>();
    return request.user as JwtAuthUser;
  },
);
