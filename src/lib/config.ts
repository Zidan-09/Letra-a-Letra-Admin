// PROD

/* const HTTPS = "https://api.letraaletradev.qzz.io";
const WSS = "wss://api.letraaletradev.qzz.io/ws/admin?token="; */

// RENDER

const HTTPS = "https://letra-a-letra-api.onrender.com";
const WSS = "wss://letra-a-letra-api.onrender.com/ws/admin?token=";

// LOCAL

/* const HTTPS = "http://localhost:8080";
const WSS = "ws://localhost:8080/ws/admin?token="; */

type HttpResponse<T> = {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export { HTTPS, WSS, type HttpResponse }