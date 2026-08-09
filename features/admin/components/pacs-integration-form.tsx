"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type ConnectionStatus = "untested" | "testing" | "invalid";

const statusConfig: Record<ConnectionStatus, { label: string; dot: string; text: string }> = {
  untested: {
    label: "Not Tested",
    dot: "bg-muted",
    text: "text-muted-foreground",
  },
  testing: {
    label: "Testing...",
    dot: "bg-amber-500",
    text: "text-foreground",
  },
  invalid: {
    label: "Invalid",
    dot: "bg-destructive",
    text: "text-destructive",
  },
};

export function PacsIntegrationForm() {
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [aeTitle, setAeTitle] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("untested");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const resetStatusOnChange = (next: (value: string) => void, value: string) => {
    next(value);
    setStatus("untested");
  };

  const handleTestConnection = () => {
    if (!name.trim() || !host.trim() || !port.trim() || !aeTitle.trim()) {
      toast.error("All connection fields are required.");
      return;
    }

    setStatus("testing");
    timerRef.current = setTimeout(() => {
      setStatus("invalid");
      toast.error("Connection Invalid", {
        description:
          "Unable to establish a connection to the PACS server. Please verify the connection settings.",
      });
    }, 1200);
  };

  const handleSave = () => {
    toast.error("Connection Required", {
      description:
        "A valid PACS connection is required before the configuration can be saved.",
    });
  };

  const { label, dot, text } = statusConfig[status];

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Connection Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Connection Status</span>
            <span className={cn("flex items-center gap-1.5 font-medium", text)}>
              {status === "testing" && <Spinner />}
              <span className={cn("size-2 rounded-full", dot)} />
              {label}
            </span>
          </div>

          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="pacsName">PACS Name</FieldLabel>
                <Input
                  id="pacsName"
                  placeholder="Hospital PACS"
                  value={name}
                  onChange={(e) => resetStatusOnChange(setName, e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="pacsHost">Host / IP Address</FieldLabel>
                <Input
                  id="pacsHost"
                  placeholder="10.10.1.20"
                  value={host}
                  onChange={(e) => resetStatusOnChange(setHost, e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="pacsPort">Port</FieldLabel>
                <Input
                  id="pacsPort"
                  type="number"
                  min="1"
                  max="65535"
                  placeholder="104"
                  value={port}
                  onChange={(e) => resetStatusOnChange(setPort, e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="pacsAeTitle">AE Title</FieldLabel>
                <Input
                  id="pacsAeTitle"
                  placeholder="HOSPITAL_PACS"
                  value={aeTitle}
                  onChange={(e) => resetStatusOnChange(setAeTitle, e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
            <Button
              type="button"
              onClick={handleTestConnection}
              disabled={status === "testing"}
              className="w-full sm:w-auto"
            >
              {status === "testing" && <Spinner data-icon="inline-start" />}
              {status === "testing" ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSave}
              className="w-full sm:w-auto"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
