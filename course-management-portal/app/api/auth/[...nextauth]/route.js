import NextAuth from "next-auth";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,

    providers: [
        {
            authorization: {
                params: {
                    scope: "openid email profile roles courses:read-approved courses:write courses:delete courses:read-published courses:enroll courses:read courses:publish courses:read-pending courses:approve courses:update",
                },
            },
            clientId: process.env.CLIENT_ID,
            client: {
                token_endpoint_auth_method: "none",
            },
            profile(profile) {
                return {
                    id: profile.sub,
                };
            },
            id: "IS7",
            name: "IS7",
            type: "oauth",
            userinfo: `${process.env.NEXT_PUBLIC_IS7_BASE_URL}/oauth2/userinfo`,
            wellKnown: `${process.env.NEXT_PUBLIC_IS7_BASE_URL}/oauth2/token/.well-known/openid-configuration`,
            issuer: `${process.env.NEXT_PUBLIC_IS7_BASE_URL}/oauth2/token`,
        },
    ],
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            if (profile) {
                user.name = profile.username
                user.email = profile.email
                user.firstName = profile.given_name
                user.lastName = profile.family_name
                user.roles = profile.roles
            }
            if (account) {
                token.id_token = account.id_token;
                token.access_token = account.access_token;
            }
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token, user }) {
            session.user = token.user;
            session = Object.assign({}, session, { accessToken: token.access_token, idToken: token.id_token })
            return session;
        },
    },
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
