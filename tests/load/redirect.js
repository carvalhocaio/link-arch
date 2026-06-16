import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
	stages: [
		{ duration: "30s", target: 20 },
		{ duration: "1m", target: 50 },
		{ duration: "30s", target: 0 },
	],
	thresholds: {
		http_req_duration: ["p(95)<500"],
		errors: ["rate<0.01"],
	},
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const TEST_KEY = __ENV.TEST_KEY || "smoke";

export default function () {
	const res = http.get(`${BASE_URL}/${TEST_KEY}`, {
		redirects: 0,
	});

	const success = check(res, {
		"status is 3xx or 404": (r) =>
			(r.status >= 300 && r.status < 400) || r.status === 404,
		"response time < 200ms": (r) => r.timings.duration < 200,
	});

	errorRate.add(!success);
	sleep(0.1);
}
