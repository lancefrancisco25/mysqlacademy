"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Download,
  Copy,
  Share2,
  Check,
  Sparkles,
  Trophy,
  Instagram,
  Smartphone,
  Square,
  Award,
  Layers,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LeaderboardShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name?: string | null;
    email?: string | null;
  } | null;
  userStats: {
    scoreAllTime: number;
    scoreThisWeek: number;
    completedLessons: number;
    completedTasks: number;
    streakDays: number;
    track: string;
  };
  rank: number | null;
}

export function LeaderboardShareModal({
  isOpen,
  onClose,
  user,
  userStats,
  rank,
}: LeaderboardShareModalProps) {
  const [format, setFormat] = useState<"story" | "square">("story");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const studentName = user?.name || "Student Scholar";
  const displayRank = rank ? `#${rank}` : "Top Cohort";

  // Canvas drawing routine
  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions: 1080x1920 (Story 9:16) or 1080x1080 (Post 1:1)
    const isStory = format === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;

    // 1. Dark Luxury Cyber Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#06080c");
    bgGrad.addColorStop(0.5, "#0a1410");
    bgGrad.addColorStop(1, "#070b09");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Glowing Orbs
    // Top-Right Emerald Glow
    const orb1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 0, width * 0.85, height * 0.15, 650);
    orb1.addColorStop(0, "rgba(16, 185, 129, 0.28)");
    orb1.addColorStop(0.5, "rgba(16, 185, 129, 0.08)");
    orb1.addColorStop(1, "transparent");
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, width, height);

    // Bottom-Left Cyan Glow
    const orb2 = ctx.createRadialGradient(width * 0.15, height * 0.85, 0, width * 0.15, height * 0.85, 550);
    orb2.addColorStop(0, "rgba(6, 182, 212, 0.2)");
    orb2.addColorStop(0.6, "rgba(6, 182, 212, 0.05)");
    orb2.addColorStop(1, "transparent");
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, width, height);

    // Center Gold Accent Glow if top 3
    if (rank && rank <= 3) {
      const orb3 = ctx.createRadialGradient(width * 0.5, height * 0.38, 0, width * 0.5, height * 0.38, 450);
      orb3.addColorStop(0, "rgba(245, 158, 11, 0.18)");
      orb3.addColorStop(1, "transparent");
      ctx.fillStyle = orb3;
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Subtle Dot Matrix Grid
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    const dotSpacing = 42;
    for (let x = 30; x < width; x += dotSpacing) {
      for (let y = 30; y < height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Outer Glowing Frame
    const margin = 54;
    const frameW = width - margin * 2;
    const frameH = height - margin * 2;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(margin, margin, frameW, frameH, 36);
    ctx.stroke();

    // Inner subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(margin + 12, margin + 12, frameW - 24, frameH - 24, 28);
    ctx.stroke();

    // 5. Header Branding: Westfield / MySQL Academy
    let currentY = isStory ? 170 : 130;

    // Database Logo Icon
    ctx.save();
    ctx.translate(margin + 44, currentY - 26);
    // Draw 3 cylinder disks in emerald
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3.5;
    ctx.fillStyle = "rgba(16, 185, 129, 0.25)";

    // Top cap
    ctx.beginPath();
    ctx.ellipse(22, 10, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Middle body
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(4, 38);
    ctx.ellipse(22, 38, 18, 7, 0, 0, Math.PI, false);
    ctx.lineTo(40, 10);
    ctx.stroke();

    // Middle divider
    ctx.beginPath();
    ctx.ellipse(22, 24, 18, 7, 0, 0, Math.PI, false);
    ctx.stroke();
    ctx.restore();

    // Brand Name Text
    ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText("MySQL", margin + 104, currentY);
    ctx.fillStyle = "#10b981";
    ctx.fillText("Academy", margin + 218, currentY);

    // Verified Cohort Pill (Top Right)
    const pillText = "ACADEMIC STANDINGS";
    ctx.font = "bold 18px monospace";
    const pillW = ctx.measureText(pillText).width + 36;
    const pillX = width - margin - 44 - pillW;
    const pillY = currentY - 28;

    ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, 38, 19);
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#34d399";
    ctx.textAlign = "center";
    ctx.fillText(pillText, pillX + pillW / 2, pillY + 25);

    // 6. Hero Rank Card Centerpiece
    currentY = isStory ? 340 : 220;

    // Rank Badge Container
    const heroH = isStory ? 390 : 250;
    const heroW = frameW - 88;
    const heroX = margin + 44;

    const heroGrad = ctx.createLinearGradient(heroX, currentY, heroX + heroW, currentY + heroH);
    heroGrad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
    heroGrad.addColorStop(1, "rgba(16, 185, 129, 0.06)");
    ctx.fillStyle = heroGrad;
    ctx.beginPath();
    ctx.roundRect(heroX, currentY, heroW, heroH, 32);
    ctx.fill();

    ctx.strokeStyle = rank && rank <= 3 ? "rgba(245, 158, 11, 0.5)" : "rgba(16, 185, 129, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Small Top Label inside Hero Card
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = rank && rank <= 3 ? "#fbbf24" : "#34d399";
    ctx.textAlign = "center";
    const statusText = rank === 1 ? "★ CLASS VALEDICTORIAN ★" : rank && rank <= 3 ? "★ TOP 3 COHORT LEADER ★" : "COHORT LEADERBOARD STANDING";
    ctx.fillText(statusText, width / 2, currentY + 54);

    // Big Giant Rank Number
    ctx.font = `900 ${isStory ? "130px" : "96px"} -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    if (rank === 1) {
      const goldGrad = ctx.createLinearGradient(0, currentY + 80, 0, currentY + 220);
      goldGrad.addColorStop(0, "#fde68a");
      goldGrad.addColorStop(0.5, "#f59e0b");
      goldGrad.addColorStop(1, "#d97706");
      ctx.fillStyle = goldGrad;
    } else if (rank === 2) {
      ctx.fillStyle = "#e2e8f0";
    } else if (rank === 3) {
      ctx.fillStyle = "#fdba74";
    } else {
      ctx.fillStyle = "#10b981";
    }

    ctx.fillText(displayRank, width / 2, currentY + (isStory ? 200 : 155));

    // Subtitle below rank
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#94a3b8";
    const subRankText = rank ? `Global Class Rank • ${userStats.scoreAllTime.toLocaleString()} Points Earned` : "Active Participant • Complete Modules to Rank";
    ctx.fillText(subRankText, width / 2, currentY + (isStory ? 260 : 205));

    if (isStory) {
      // Progress percent pill
      const pctText = rank && rank <= 5 ? "Top 5% of all active engineering students" : "Verified In-Browser SQLite WASM Query Mastery";
      ctx.font = "17px monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText(pctText, width / 2, currentY + 315);
    }

    // 7. Student Identity Section
    currentY += heroH + (isStory ? 60 : 35);

    // Avatar Circle
    const avatarR = isStory ? 54 : 42;
    const avatarX = width / 2;
    const avatarY = currentY + avatarR;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Initial Letter
    const initial = studentName.charAt(0).toUpperCase();
    ctx.font = `bold ${isStory ? "48px" : "36px"} sans-serif`;
    ctx.fillStyle = "#34d399";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initial, avatarX, avatarY);
    ctx.restore();

    // Student Name
    currentY = avatarY + avatarR + (isStory ? 28 : 20);
    ctx.font = `bold ${isStory ? "42px" : "32px"} -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(studentName, width / 2, currentY);

    // Track Badge Pill
    currentY += isStory ? 38 : 28;
    const trackText = `🎓 ${userStats.track}`;
    ctx.font = "bold 19px monospace";
    const trackW = ctx.measureText(trackText).width + 36;
    const trackX = width / 2 - trackW / 2;

    ctx.fillStyle = "rgba(14, 165, 233, 0.12)";
    ctx.beginPath();
    ctx.roundRect(trackX, currentY - 24, trackW, 36, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(14, 165, 233, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.fillText(trackText, width / 2, currentY);

    // 8. 4-Box Bento Stats Grid (Instagram Wrapped style)
    currentY += isStory ? 75 : 55;
    const cardGap = 20;
    const cardW = (heroW - cardGap) / 2;
    const cardH = isStory ? 165 : 125;
    const leftX = heroX;
    const rightX = heroX + cardW + cardGap;

    const statsData = [
      {
        icon: "🏆",
        label: "TOTAL POINTS",
        value: `${userStats.scoreAllTime.toLocaleString()}`,
        unit: "pts",
        accent: "#10b981",
        bg: "rgba(16, 185, 129, 0.08)",
        border: "rgba(16, 185, 129, 0.3)",
      },
      {
        icon: "🎓",
        label: "MODULES MASTERED",
        value: `${userStats.completedLessons}`,
        unit: "/ 16",
        accent: "#38bdf8",
        bg: "rgba(14, 165, 233, 0.08)",
        border: "rgba(14, 165, 233, 0.3)",
      },
      {
        icon: "💻",
        label: "SQL PROBLEMS",
        value: `${userStats.completedTasks}`,
        unit: "solved",
        accent: "#a855f7",
        bg: "rgba(168, 85, 247, 0.08)",
        border: "rgba(168, 85, 247, 0.3)",
      },
      {
        icon: "🔥",
        label: "ACTIVE STREAK",
        value: `${userStats.streakDays}`,
        unit: "days",
        accent: "#f43f5e",
        bg: "rgba(244, 63, 94, 0.08)",
        border: "rgba(244, 63, 94, 0.3)",
      },
    ];

    // Row 1
    [statsData[0], statsData[1]].forEach((stat, i) => {
      const bx = i === 0 ? leftX : rightX;
      const by = currentY;

      ctx.fillStyle = stat.bg;
      ctx.beginPath();
      ctx.roundRect(bx, by, cardW, cardH, 22);
      ctx.fill();
      ctx.strokeStyle = stat.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "bold 16px monospace";
      ctx.fillStyle = stat.accent;
      ctx.textAlign = "left";
      ctx.fillText(`${stat.icon} ${stat.label}`, bx + 26, by + 38);

      ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(stat.value, bx + 26, by + 94);

      const valW = ctx.measureText(stat.value).width;
      ctx.font = "bold 20px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(` ${stat.unit}`, bx + 26 + valW, by + 94);
    });

    // Row 2 (if story or scaled)
    if (isStory) {
      const row2Y = currentY + cardH + cardGap;
      [statsData[2], statsData[3]].forEach((stat, i) => {
        const bx = i === 0 ? leftX : rightX;
        const by = row2Y;

        ctx.fillStyle = stat.bg;
        ctx.beginPath();
        ctx.roundRect(bx, by, cardW, cardH, 22);
        ctx.fill();
        ctx.strokeStyle = stat.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = "bold 16px monospace";
        ctx.fillStyle = stat.accent;
        ctx.textAlign = "left";
        ctx.fillText(`${stat.icon} ${stat.label}`, bx + 26, by + 38);

        ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(stat.value, bx + 26, by + 94);

        const valW = ctx.measureText(stat.value).width;
        ctx.font = "bold 20px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(` ${stat.unit}`, bx + 26 + valW, by + 94);
      });
      currentY = row2Y + cardH;
    } else {
      currentY += cardH;
    }

    // 9. Code Snippet Verification Box (Story only)
    if (isStory) {
      currentY += 45;
      const snippetH = 140;
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(heroX, currentY, heroW, snippetH, 20);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "15px monospace";
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "left";
      ctx.fillText("-- Westfield Academy Verified Query Signature", heroX + 24, currentY + 36);

      ctx.font = "bold 17px monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("SELECT student, rank, points FROM leaderboard WHERE status = 'mastered';", heroX + 24, currentY + 74);

      ctx.font = "15px monospace";
      ctx.fillStyle = "#10b981";
      ctx.fillText("✓ Query evaluated in client WASM engine • 100% Verified", heroX + 24, currentY + 110);
    }

    // 10. Footer CTA & Link Branding
    const footerY = height - margin - 35;
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#10b981";
    ctx.textAlign = "left";
    ctx.fillText("mysqlacademy.org/leaderboard", margin + 44, footerY);

    ctx.font = "17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";
    ctx.fillText("Challenge my standing on MySQL Academy", width - margin - 44, footerY);
  }, [format, displayRank, studentName, rank, userStats]);

  // Redraw when modal opens or format changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        drawCard();
      }, 50);
    }
  }, [isOpen, format, drawCard]);

  // Download Image Handler
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    try {
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      const safeName = (user?.name || "student").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `mysql-academy-rank-${safeName}-${format}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Rank card exported successfully! Ready for Instagram Story.");
    } catch (err) {
      toast.error("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard Handler
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setCopied(true);
          toast.success("Image copied to clipboard! Paste directly into Instagram or chat.");
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // Fallback: download if clipboard item API not supported
          handleDownload();
        }
      }, "image/png");
    } catch {
      handleDownload();
    }
  };

  // Native Web Share Handler
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share && navigator.canShare) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `mysql-academy-rank-${format}.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "My MySQL Academy Cohort Ranking",
              text: `I'm ranked ${displayRank} on the MySQL Academy cohort leaderboard with ${userStats.scoreAllTime.toLocaleString()} points!`,
              url: "https://mysqlacademy.org/leaderboard",
              files: [file],
            });
            toast.success("Shared successfully!");
            return;
          }
          handleDownload();
        });
      } catch {
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/80 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-sm sm:text-base font-bold text-foreground">
                Export Instagram Rank Story
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                {studentName} • {displayRank} Standing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close export modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: Controls & Card Live Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 terminal-scrollbar">
          {/* Format Selector Pills */}
          <div className="flex items-center justify-between gap-3 bg-muted/40 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setFormat("story")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                format === "story"
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <span>Instagram Story (9:16)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat("square")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                format === "square"
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Square className="h-4 w-4 text-sky-400" />
              <span>Feed Post (1:1 Square)</span>
            </button>
          </div>

          {/* Interactive Card Canvas Container */}
          <div className="flex justify-center items-center py-2 bg-black/40 rounded-xl border border-border/60 p-4 overflow-hidden">
            <canvas
              ref={canvasRef}
              className={cn(
                "rounded-xl shadow-2xl transition-all duration-300 border border-emerald-500/30",
                format === "story"
                  ? "w-[240px] sm:w-[280px] aspect-[9/16]"
                  : "w-[280px] sm:w-[340px] aspect-square"
              )}
            />
          </div>

          <div className="text-center text-[11px] text-muted-foreground font-mono">
            High-Resolution 1080p PNG • Ready to share on Instagram Stories, X (Twitter), Discord, or LinkedIn.
          </div>
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="p-4 border-t border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Rank {displayRank} • {userStats.scoreAllTime.toLocaleString()} pts</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 sm:flex-none text-xs h-9 gap-1.5 border-border"
              title="Copy rank image to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-sky-400" />
                  <span>Copy Image</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 sm:flex-none text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
              title="Download high-resolution image"
            >
              <Download className="h-4 w-4" />
              <span>Download PNG</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              className="flex-none text-xs h-9 px-2.5 border-border text-muted-foreground hover:text-foreground"
              title="Share via device share menu"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
