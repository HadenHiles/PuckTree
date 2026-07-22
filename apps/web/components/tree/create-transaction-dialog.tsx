"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionKind } from "@pucktree/domain";

interface CreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTransaction: (transaction: {
    kind: TransactionKind;
    transactionDate: string;
  }) => void;
}

export function CreateTransactionDialog({
  open,
  onOpenChange,
  onCreateTransaction,
}: CreateTransactionDialogProps) {
  const [kind, setKind] = useState<TransactionKind>("trade");
  const [date, setDate] = useState("");

  const handleCreate = () => {
    if (!date) return;

    onCreateTransaction({
      kind,
      transactionDate: date,
    });

    // Reset form
    setKind("trade");
    setDate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction node to connect assets in your tree.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-kind">Transaction Type</Label>
            <Select
              value={kind}
              onValueChange={(value) =>
                setKind(value as TransactionKind)
              }
            >
              <SelectTrigger id="transaction-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trade">Trade</SelectItem>
                <SelectItem value="waiver">Waiver</SelectItem>
                <SelectItem value="signing">Signing</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction-date">Date *</Label>
            <Input
              id="transaction-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!date}>
            Create Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
