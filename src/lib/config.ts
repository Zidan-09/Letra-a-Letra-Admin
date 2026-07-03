const HTTP = "https://api.letraaletradev.qzz.io"

type HttpResponse<T> = {
    success: boolean,
    message: string,
    data: T
}

export { HTTP, type HttpResponse }