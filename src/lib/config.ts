const HTTP = "http://localhost:8080"

type HttpResponse<T> = {
    success: boolean,
    message: string,
    data: T
}

export { HTTP, type HttpResponse }