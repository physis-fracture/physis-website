"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Network, Plus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AddStudyMenu() {
  const router = useRouter();
  const [pacsDialogOpen, setPacsDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Add study">
            <Plus data-icon="inline-start" />
            Add Study
            <ChevronDown data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => router.push("/studies/new")}>
              <Upload />
              Manual Upload
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setPacsDialogOpen(true)}>
              <Network />
              Import from PACS
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pacsDialogOpen} onOpenChange={setPacsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PACS Not Configured</DialogTitle>
            <DialogDescription>
              Configure and validate a PACS connection before importing
              studies.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => router.push("/admin/pacs")}>
              Go to PACS Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
