"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BarChart3, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { createClient } from "~/lib/supabase";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(getErrorMessage(authError.message));
        return;
      }

      if (data.user) {
        // Redirecionar para a página original ou dashboard
        const redirectTo = redirectedFrom ?? "/dashboard";
        router.push(redirectTo);
        router.refresh(); // Força refresh para atualizar o estado de autenticação
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (message: string): string => {
    const errorMessages: Record<string, string> = {
      "Invalid login credentials": "Email ou senha incorretos",
      "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada.",
      "Too many requests": "Muitas tentativas. Tente novamente em alguns minutos.",
      "User not found": "Usuário não encontrado",
      "Invalid email": "Email inválido",
      "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
    };

    return errorMessages[message] ?? "Erro de autenticação. Verifique suas credenciais.";
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Sistema de Análise Logística
        </CardTitle>
        <CardDescription>
          Faça login para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <Link 
            href="/" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <Card className="shadow-2xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando...</p>
              </div>
            </CardContent>
          </Card>
        }>
          <LoginForm />
        </Suspense>
        
        {/* Informações de desenvolvimento */}
        <Card className="mt-4 bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium mb-2">Ambiente de Desenvolvimento</p>
              <p className="text-xs">
                Para testar o sistema, use as credenciais fornecidas pela equipe de desenvolvimento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}