import { NextResponse } from "next/server";

/**
 * Health check endpoint para monitoramento Docker
 * GET /api/health
 */
export async function GET() {
  try {
    // Verificar se a aplicação está funcionando
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version ?? "unknown",
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}