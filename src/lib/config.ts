const HTTP = "http://localhost:8080"
const WS = "ws://localhost:8080/ws/game"

type HttpResponse<T> = {
    success: boolean,
    message: string,
    data: T
}

export { HTTP, WS, type HttpResponse }