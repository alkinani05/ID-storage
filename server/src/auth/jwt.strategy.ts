import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                ExtractJwt.fromUrlQueryParameter('token'),
            ]),
            ignoreExpiration: false,
            secretOrKey: 'SUPER_SECRET_KEY_CHANGE_THIS', // TODO: Move to .env
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email, plan: payload.plan };
    }
}
