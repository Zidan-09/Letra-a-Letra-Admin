const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

type HttpResponse<T> = {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

type SuccessResponse<T> = {
    success: true;
    data: T;
}

type SuccessResponseVoid = {
    success: true;
    data: Record<string, never>;
}

type ErrorResponse = {
    success: false;
    code: string;
    message: string;
}

function isSuccess<T>(payload: unknown): payload is SuccessResponse<T> {
    return typeof payload === "object" && payload !== null && (payload as { success?: unknown }).success === true && "data" in payload;
}

export { API_URL, WS_URL, type HttpResponse, type SuccessResponse, type SuccessResponseVoid, type ErrorResponse, isSuccess }