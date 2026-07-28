import { HTTPS } from "../lib/config.ts";

const offer = "e6d328c4-326c-4a90-8ecb-6e4212cd367d";
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

    res = await fetch(`${HTTPS}/shop/offers/${offer}/buy`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    json = await res.json();

    console.log(json);
}

buy();