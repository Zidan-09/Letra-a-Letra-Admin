class User {
    private id: string;
    private token: string;

    constructor() {
        this.id = "";
        this.token = ""
    }

    getId() {
        return this.id;
    }

    setId(id: string) {
        this.id = id;
    }

    getToken() {
        return this.token;
    }

    setToken(token: string) {
        this.token = token;
    }
}

const user = new User();

export { user }