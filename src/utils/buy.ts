import { HTTPS } from "../lib/config.ts";

const offer = "3fb9bf3b-a168-43a7-8163-c186220efe36";
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