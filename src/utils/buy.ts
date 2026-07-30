import { HTTPS } from "../lib/config.ts";

const offer = "23f36958-373f-4f06-828a-a996a65d74a6";
const user = "wadawueu@email.com"

let token: string;

async function auth() {
    const res = await fetch(`${HTTPS}/user/auth`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user,
            password: "12345678"
        })
    });

    const json = await res.json();

    console.log(json);

    token = json.data.token;
}

async function buy() {
    await auth();

    let res = await fetch(`${HTTPS}/shop/offers/${offer}/buy`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    let json = await res.json();

    console.log(json);

    /* res = await fetch(`${HTTPS}/shop/offers/${offer}/buy`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    json = await res.json();

    console.log(json); */
}

buy();