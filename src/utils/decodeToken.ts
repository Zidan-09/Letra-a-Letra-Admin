import { jwtDecode } from "jwt-decode";

type JwtPayload = {
    id: string,
    admin: boolean
}

export class JwtDecoderUtil {
    static decode(token: string) {
        return jwtDecode<JwtPayload>(token);
    }
}