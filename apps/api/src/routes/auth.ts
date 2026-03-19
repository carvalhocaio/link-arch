import { Elysia, t } from "elysia";
import { auth } from "../lib/auth";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
	.post(
		"/sign-up",
		async ({ body }) => {
			if (body.password !== body.passwordConfirmation) {
				return new Response(JSON.stringify({ error: "Passwords do not match" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			try {
				const response = await auth.api.signUpEmail({
					body: {
						name: body.name,
						email: body.email,
						password: body.password,
					},
					asResponse: true,
				});

				return response;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Sign up failed";

				return new Response(JSON.stringify({ error: message }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				email: t.String({ format: "email" }),
				password: t.String({ minLength: 8 }),
				passwordConfirmation: t.String({ minLength: 8 }),
			}),
			detail: {
				tags: ["Auth"],
				summary: "Create a new account",
			},
		},
	)
	.post(
		"/sign-in",
		async ({ body }) => {
			try {
				const response = await auth.api.signInEmail({
					body: {
						email: body.email,
						password: body.password,
					},
					asResponse: true,
				});

				return response;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Invalid credentials";

				return new Response(JSON.stringify({ error: message }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				password: t.String({ minLength: 8 }),
			}),
			detail: {
				tags: ["Auth"],
				summary: "Sign in with email and password",
			},
		},
	);
