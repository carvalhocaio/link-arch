import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
	// Stress test: ramp up to high load to find breaking point
	stages: [
		{ duration: "1m", target: 100 },
		{ duration: "2m", target: 500 },
		{ duration: "1m", target: 1000 },
		{ duration: "1m", target: 0 },
	],
	thresholds: {
		http_req_duration: ["p(95)<1000"],
		errors: ["rate<0.05"],
	},
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const SESSION_COOKIE = __ENV.SESSION_COOKIE || "";

export default function () {
	const url = `https://example.com/stress-test-${Date.now()}`;
	const payload = JSON.stringify({ url });
	const params = {
		headers: {
			"Content-Type": "application/json",
			Cookie: `better-auth.session_token=${SESSION_COOKIE}`,
		},
	};

	const res = http.post(`${BASE_URL}/api/shorten`, payload, params);

	const success = check(res, {
		"status is 200 or 401": (r) => r.status === 200 || r.status === 401,
		"no server errors": (r) => r.status < 500,
	});

	errorRate.add(!success);
	sleep(0.1);
}
