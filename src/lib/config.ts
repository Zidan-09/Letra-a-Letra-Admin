const HTTPS = "https://api.letraaletradev.qzz.io";
const WSS = "wss://api.letraaletradev.qzz.io/ws/admin?token=";

/* const HTTPS = "http://localhost:8080";
const WSS = "ws://localhost:8080/ws/admin?token="; */

type HttpResponse<T> = {
    success: boolean,
    message: string,
    data: T
}

export { HTTPS, WSS, type HttpResponse }