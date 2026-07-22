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
import type { NormalizedAssetCandidate } from "@pucktree/domain";

interface CreateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAsset: (asset: Omit<NormalizedAssetCandidate, "id" | "displayLabel" | "confidence">) => void;
}

export function CreateAssetDialog({
  open,
  onOpenChange,
  onCreateAsset,
}: CreateAssetDialogProps) {
  const [assetType, setAssetType] = useState<"player" | "draft-pick">(
    "player"
  );
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState<
    "Left Wing" | "Right Wing" | "Center" | "Defenseman" | "Goalie" | ""
  >("");
  const [draftYear, setDraftYear] = useState("");
  const [round, setRound] = useState("");

  const handleCreate = () => {
    if (assetType === "player") {
      if (!playerName.trim()) return;

      onCreateAsset({
        kind: "player",
        playerRef: {
          playerName: playerName.trim(),
          normalizedName: playerName.trim().toLowerCase(),
          nhlPlayerId: null,
          position: position || null,
          confidence: "manual",
        },
        draftYear: null,
        round: null,
        overall: null,
        conditionsText: null,
      });
    } else {
      if (!draftYear.trim()) return;

      onCreateAsset({
        kind: "draft-pick",
        playerRef: null,
        draftYear: parseInt(draftYear, 10),
        round: round ? parseInt(round, 10) : null,
        overall: null,
        conditionsText: null,
      });
    }

    // Reset form
    setPlayerName("");
    setPosition("");
    setDraftYear("");
    setRound("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Asset</DialogTitle>
          <DialogDescription>
            Create a new player or draft pick asset to add to your tree.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="asset-type">Asset Type</Label>
            <Select
              value={assetType}
              onValueChange={(value) =>
                setAssetType(value as "player" | "draft-pick")
              }
            >
              <SelectTrigger id="asset-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="draft-pick">Draft Pick</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assetType === "player" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="player-name">Player Name *</Label>
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g., Connor McDavid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={position}
                  onValueChange={(value) =>
                    setPosition(
                      value as
                        | "Left Wing"
                        | "Right Wing"
                        | "Center"
                        | "Defenseman"
                        | "Goalie"
                        | ""
                    )
                  }
                >
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Left Wing">Left Wing</SelectItem>
                    <SelectItem value="Right Wing">Right Wing</SelectItem>
                    <SelectItem value="Center">Center</SelectItem>
                    <SelectItem value="Defenseman">Defenseman</SelectItem>
                    <SelectItem value="Goalie">Goalie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="draft-year">Draft Year *</Label>
                <Input
                  id="draft-year"
                  type="number"
                  value={draftYear}
                  onChange={(e) => setDraftYear(e.target.value)}
                  placeholder="e.g., 2024"
                  min="1917"
                  max="2100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="round">Round</Label>
                <Input
                  id="round"
                  type="number"
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  placeholder="e.g., 1"
                  min="1"
                  max="10"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              assetType === "player"
                ? !playerName.trim()
                : !draftYear.trim()
            }
          >
            Create Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
