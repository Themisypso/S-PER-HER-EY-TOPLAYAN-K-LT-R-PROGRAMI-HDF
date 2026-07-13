/**
 * Centralized API response helpers
 *
 * Use these instead of raw NextResponse.json() calls so that every
 * API route returns a consistent shape the frontend can rely on:
 *
 *   Success  → { success: true,  data: <payload> }
 *   Error    → { success: false, error: <message> }
 *
 * HTTP status codes follow REST conventions:
 *   200 OK, 201 Created, 400 Bad Request, 401 Unauthorized,
 *   403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error
 */

import { NextResponse } from 'next/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
    success: true
    data: T
}

export interface ApiError {
    success: false
    error: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// ─── Success helpers ──────────────────────────────────────────────────────────

/** 200 OK with data payload */
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
    return NextResponse.json({ success: true, data }, { status })
}

/** 201 Created with data payload */
export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
    return ok(data, 201)
}

// ─── Error helpers ────────────────────────────────────────────────────────────

/** 400 Bad Request */
export function badRequest(error: string): NextResponse<ApiError> {
    return NextResponse.json({ success: false, error }, { status: 400 })
}

/** 401 Unauthorized */
export function unauthorized(error = 'Unauthorized'): NextResponse<ApiError> {
    return NextResponse.json({ success: false, error }, { status: 401 })
}

/** 403 Forbidden */
export function forbidden(error = 'Forbidden'): NextResponse<ApiError> {
    return NextResponse.json({ success: false, error }, { status: 403 })
}

/** 404 Not Found */
export function notFound(error = 'Not found'): NextResponse<ApiError> {
    return NextResponse.json({ success: false, error }, { status: 404 })
}

/** 409 Conflict */
export function conflict(error: string): NextResponse<ApiError> {
    return NextResponse.json({ success: false, error }, { status: 409 })
}

/** 500 Internal Server Error */
export function serverError(error = 'Internal server error'): NextResponse<ApiError> {
    return NextResponse.json({ success: false, error }, { status: 500 })
}
