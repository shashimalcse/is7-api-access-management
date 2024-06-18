import NextAuth from "next-auth"

const handler = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,

    providers: [
        {
            authorization: {
                params: {
                    scope: "openid email profile"
                }
            },
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            id: "IS7",
            name: "IS7",
            profile(profile) {

                return {
                    id: profile.sub
                };
            },
            type: "oauth",
            userinfo: `${process.env.NEXT_PUBLIC_IS7_BASE_URL}/oauth2/userinfo`,
            wellKnown: `${process.env.NEXT_PUBLIC_IS7_BASE_URL}/oauth2/token/.well-known/openid-configuration`,
            issuer: `${process.env.NEXT_PUBLIC_IS7_BASE_URL}/oauth2/token`,
            callbackUrl: process.env.NEXT_PUBLIC_HOSTED_URL
        }
    ],
    callbacks: {
        async jwt(token, account, profile) {
            console.log(account, profile);
            if (account?.accessToken) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session(session, user) {
            session.accessToken = user.accessToken;
            return session;
        }
    }
})

export { handler as GET, handler as POST }
