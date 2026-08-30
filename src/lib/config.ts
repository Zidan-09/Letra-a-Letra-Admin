const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

type HttpResponse<T> = {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export { API_URL, WS_URL, type HttpResponse }