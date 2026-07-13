import { jwtDecode } from "jwt-decode";

type JwtPayload = {
    id: string,
    role: string
}

export class JwtDecoderUtil {
    static decode(token: string) {
        return jwtDecode<JwtPayload>(token);
    }
}