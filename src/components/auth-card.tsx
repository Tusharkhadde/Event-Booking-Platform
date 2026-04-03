"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Github, Chrome } from "lucide-react";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
  onSubmit
}: AuthCardProps) {
  return (
    <div className="w-full max-w-sm">
      <Card className="w-full border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <form onSubmit={onSubmit} className="grid gap-5">
            {children}
          </form>

          <div className="relative">
            <Separator className="bg-border" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-border bg-background text-foreground hover:bg-accent transition-all duration-200"
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-border bg-background text-foreground hover:bg-accent transition-all duration-200"
            >
              <Chrome className="h-4 w-4 mr-2" />
              Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-center text-sm text-muted-foreground pb-8">
          {footerText}
          <a className="ml-1 text-[#F59E0B] hover:underline font-medium" href={footerLinkHref}>
            {footerLinkText}
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
