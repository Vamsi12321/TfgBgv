import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/config/backend";

const BACKEND = BACKEND_URL;

// Allow long-running requests (AI screening can take 60+ seconds)
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams);
}

export async function POST(req, { params }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams);
}

export async function PUT(req, { params }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams);
}

export async function DELETE(req, { params }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams);
}

export async function PATCH(req, { params }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams);
}

async function proxyRequest(req, params) {
  const path = params.path.join("/");

  // Get query parameters from the request URL
  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();

  // Construct backend URL with query parameters
  const backendUrl = queryString
    ? `${BACKEND}/${path}?${queryString}`
    : `${BACKEND}/${path}`;

  // Clone headers and remove problematic ones
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding"); // Important: let Next.js handle encoding

  // Skip ngrok browser warning interstitial page when using ngrok tunnels
  headers.set("ngrok-skip-browser-warning", "true");

  let body = null;
  let fetchHeaders = headers;

  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      const contentType = req.headers.get("content-type");

      // Handle FormData (multipart/form-data) - pass through as FormData
      if (contentType && contentType.includes("multipart/form-data")) {
        // For FormData, we need to pass the original FormData
        // Remove content-type header to let fetch set it with boundary
        fetchHeaders = new Headers(headers);
        fetchHeaders.delete("content-type");

        // Get the FormData from the request
        body = await req.formData();
      } else {
        // Handle JSON or text
        body = await req.text();
      }
    } catch (e) {
      console.error("Error reading request body:", e);
    }
  }

  try {
    // Use AbortController with 90s timeout for long-running requests (AI screening etc.)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers: fetchHeaders,
      body,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Read the response based on content type
    const contentType = backendRes.headers.get("content-type");
    const contentDisposition = backendRes.headers.get("content-disposition");

    // Create response headers
    const responseHeaders = new Headers();

    // Copy important headers (skip content-length as Next.js will set it)
    backendRes.headers.forEach((value, key) => {
      if (
        key !== "content-encoding" &&
        key !== "transfer-encoding" &&
        key !== "content-length" &&
        key !== "set-cookie" // Handle set-cookie separately below
      ) {
        responseHeaders.set(key, value);
      }
    });

    // Handle set-cookie headers — only forward for auth endpoints, not for all requests
    // This prevents jobseeker session cookies from contaminating org sessions and vice versa
    const isAuthEndpoint = path.includes("auth/login") || path.includes("jobseeker/login") || path.includes("jobseeker/register");
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie && isAuthEndpoint) {
      responseHeaders.set("set-cookie", setCookie);
    }

    // If it's a file download (has content-disposition or non-json/text content type), stream as binary
    const isFileDownload = contentDisposition ||
      (contentType && !contentType.includes("application/json") && !contentType.includes("text/"));

    if (isFileDownload) {
      const blob = await backendRes.arrayBuffer();
      return new NextResponse(blob, {
        status: backendRes.status,
        headers: responseHeaders,
      });
    }

    // Handle JSON
    let responseData;
    if (contentType && contentType.includes("application/json")) {
      responseData = await backendRes.json();
    } else {
      responseData = await backendRes.text();
    }

    // Return appropriate response
    if (typeof responseData === "object") {
      return NextResponse.json(responseData, {
        status: backendRes.status,
        headers: responseHeaders,
      });
    } else {
      return new NextResponse(responseData, {
        status: backendRes.status,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Proxy request failed", detail: error.message },
      { status: 500 }
    );
  }
}
